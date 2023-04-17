import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

import Chonky from '../Chonky/Chonky'

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

  const upload = async (e) => {
    const data = e.path
    let { error } = await supabase.from('images').insert({image_url: data, user_id: session.user.id})
  }



  const uploadStorage = async () => {
    for (let i = 0; i < image.length; i++){
      const file = image[i]
      var url = session.user.id + '/' + file.name
      const { data, error } = await supabase.storage.from('images').upload(url, file, {
        cacheControl: '3600',
        upsert: false
      })
      if (data){
        upload(data)
      }
      if (error){
        console.log(error)
      }
    }
  }
  

  return (
    <div>
      <Chonky />
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>uploadStorage()}>Post</button>
    </div>
  )
}