import React from 'react'

export default function Home(){

  const [image, setImage] = React.useState([])

  //sends base64 image to server
  function postData(e){
    var xhr = new XMLHttpRequest()
    xhr.addEventListener('load', ()=>{
      console.log(xhr.responseText)
    })
    xhr.open('POST', 'http://localhost:5000')
    xhr.send(e)
  }

  //converts image into base64 so it can be sent to server
  const convertToBase64 = () => {
    for (let i=0; i<image.length; i++){
      const reader = new FileReader()
      reader.readAsDataURL(image[i])
      reader.onloadend = () => {
        postData(reader.result)
      }
    }
  }

  return(
    <div>
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>convertToBase64()}>Post</button>
    </div>
  )
}