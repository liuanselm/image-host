import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

  const [image, setImage] = React.useState([])

  useEffect(() => {
    async function getProfile() {
      setLoading(true)
      const { user } = session

      let { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', user.id)
        .single()

      if (error) {
        console.warn(error)
      } else if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
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

  //upload function for database table, not needed as currently using postgres triggers.
  const upload = async (e) => {
    const url = e.path
    const { data, error } = await supabase.from('images').insert({image_url: url, user_id: session.user.id}).select()
    if (data){
      console.log(data)
    }
  }



  const uploadStorage = async () => {
    for (let i = 0; i < image.length; i++){
      const file = image[i]
      var url = 'public/' + session.user.id + '/' + file.name
      const { data, error } = await supabase.storage.from('images').upload(url, file, {
        cacheControl: '3600',
        upsert: false
      })
      if (error){
        console.log(error)
      }
    }
  }
  

  return (
    <div>
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>uploadStorage()}>Post</button>
    </div>
  )
}

//(auth.uid() = user_id)