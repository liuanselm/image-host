import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import './Home.css'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  const [image, setImage] = React.useState([])
  const [folder, setFolder] = React.useState(null)
  const [bucket, setBucket] = React.useState(null)
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

  //when folder path is updated, get the contents of that folder
  useEffect(()=>{
    getContent()
    getBucket()
  },[folder])

  //upload functionality, uploads image to supabase storage
  const uploadStorage = async () => {
    for (let i = 0; i < image.length; i++){
      const file = image[i]
      var url = 'public/' + folder + '/' + file.name
      const { data, error } = await supabase.storage.from('images').upload(url, file, {
        cacheControl: '3600',
        upsert: false
      })
      //if upload was successful, call getContent to get updated page
      if (data){
        getBucket()
      } 
      if (error){
        console.log(error)
      }
    }
  }

  //gets the content of the page/folder for the folders
  const getContent = async() =>{
    if (folder != null){
      const { data, error } = await supabase.from('pages').select('content').eq('uuid', folder)
      if (data){
        setContent(data[0].content)
      }
      else{
        console.log(error)
      }
    }
  }

  
  const getBucket = async () => {
    const {data, error} = await supabase.storage.from('images').list("public/" + folder , {
      sortBy: { column: 'name', order: 'asc' },
    })
    if (data){
      setBucket(data)
    }
  }

  const newFolder = async () => {
    const { data, error } = await supabase.from('pages').insert({owner: session.user.id}).select('uuid')
    if (data){
      newFolderUpdateContent(data[0].uuid)
    }
    if (error){
      console.log(error)
    }
  }

  const newFolderUpdateContent = async (path) => {
    const { data, error } = await supabase.from('pages').update({ content: content.concat({"type" : "folder", "path" : path})}).eq('uuid', folder)
    if (data){
      getContent()
    }
  }

  /*
  const getImage = (img) => {
    const { data, error } = supabase.storage.from('images').getPublicUrl(img)
    if (data){
      return data.publicUrl
    }
    else{
      console.log(error)
    }
  }
*/

  return (
    <div>
      <div>
        {
          content ? content.map((item, index)=>
            <span key={index}>
              {
                item.type === 'folder' ? 
                <span onClick={()=>setFolder(item.path)} key={item.path} className='item'>
                  <span style={{padding: '5px'}}>{item.path}</span>
                </span> : <span></span>
              }
            </span>
          ) : <span>null</span>
        }
      </div>
      <div>
        {
          bucket ? bucket.map((item, index)=>
            <span key={item.name} className='item'>
              <span style={{padding: '5px'}}>{item.name}</span>
            </span>
          ) : <span>null</span>
        }
      </div>
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>uploadStorage()}>Post</button>
      <button onClick={()=>newFolder()}>New Folder</button>
    </div>
  )
}

//(auth.uid() = user_id)