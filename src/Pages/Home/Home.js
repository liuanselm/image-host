import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  const [image, setImage] = React.useState([])
  const [folder, setFolder] = React.useState([])
  const [content, setContent] = React.useState(null)

  useEffect(() => {
    async function getProfile() {
      setLoading(true)
      const { user } = session

      let { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, root`)
        .eq('id', user.id)
        .single()

      if (error) {
        console.warn(error)
      } else if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        setFolder(data.root)
      }

      setLoading(false)
    }

    getProfile()
  }, [session])

  async function updateProfile(event) {
    event.preventDefault()

    setLoading(true)
    const { user } = session

    const updates = {
      id: user.id,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    }

    let { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  //non authenticating functions

  useEffect(()=>{
    getContent()
  },[folder])

  const getContent = async() =>{
    if (folder[0] != null){
      const { data, error } = await supabase.from('pages').select('content').eq('uuid', folder)
      if (data){
        setContent(data)
      }
      else{
        console.log(error)
      }
    }
  }

  const uploadStorage = async () => {
    for (let i = 0; i < image.length; i++){
      const file = image[i]
      var url = 'public/' + folder + '/' + file.name
      const { data, error } = await supabase.storage.from('images').upload(url, file, {
        cacheControl: '3600',
        upsert: false
      })
      if (data){
        getContent()
      } 
      if (error){
        console.log(error)
      }
    }
  }

  const getBucket = async (path) => {
    const {data, error} = await supabase.storage.from('images').list(path, {
      sortBy: { column: 'name', order: 'asc' },
    })
    if (data){
      console.log(data)
    }
  }

  getBucket("public/1a594101-0cf3-497f-81ea-57daedb18f31/")

  return (
    <div>
      <div>
        {
          content ? content[0].content.map((item)=><span style={{padding: '5px'}}>{item.path}</span>) : <span>null</span>
        }
      </div>
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>uploadStorage()}>Post</button>
    </div>
  )
}

//(auth.uid() = user_id)