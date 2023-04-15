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

  const upload = async (e) => {
    const data = JSON.parse(e)
    let { error } = await supabase.from('images').insert({image_url: data.url, user_id: session.user.id})
  }

  //sends base64 image to server
  function postData(e, imgName){
    var xhr = new XMLHttpRequest()
    xhr.addEventListener('load', ()=>{
      upload(xhr.responseText)
      console.log(xhr.responseText)
    })
    xhr.open('POST', 'http://localhost:5000')
    const data = {image: e, user: session.user.id, name: imgName}
    xhr.send(JSON.stringify(data))
  }

  //converts image into base64 so it can be sent to server
  const convertToBase64 = () => {
    for (let i=0; i<image.length; i++){
      const reader = new FileReader()
      reader.readAsDataURL(image[i])
      reader.onloadend = () => {
        postData(reader.result, image[i].name)
      }
    }
  }

  return (
    <div>
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>convertToBase64()}>Post</button>
    </div>
  )
}