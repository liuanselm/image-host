import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr';

import './Home.css'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)

  const [image, setImage] = React.useState([])
  const [bucket, setBucket] = React.useState(null)
  const [content, setContent] = React.useState(null)
  const [selected, setSelected] = React.useState([])
  const [fileSelected, setFileSelected] = React.useState([])
  const [history, setHistory] = React.useState(null)
  const [displayPopUp, setDisplayPopUp] =  React.useState(false)
  const [folderName, setFolderName] = React.useState('')
  const inputRef = React.useRef();

  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function sessionReload() {
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
        if (searchParams.get('id') == data.root || searchParams.get('id') == 'null' || searchParams.get('id') == null || searchParams.get('id') == ''){
          navigate({pathname: '/', search: '?id='+ data.root})
        }
        else{
          navigate({pathname: '/', search: '?id=' + searchParams.get('id')})
        }
      }
      setLoading(false)
    }
    sessionReload()
    
  }, [session])
  
  
  useEffect(()=>{
    let path = searchParams.get('id')
    if (path != null){
      if (path.length == 36){
        getBucket(path)
        getContent(path)
      }
      else if (path.length != 36){
  
      }
    }
  },[location])

  //non authenticating functions

  //upload functionality, uploads image to supabase storage
  const uploadStorage = async () => {
    for (let i = 0; i < image.length; i++){
      const file = image[i]
      var url = 'public/' + searchParams.get('id') + '/' + file.name
      const { data, error } = await supabase.storage.from('images').upload(url, file, {
        cacheControl: '3600',
        upsert: false
      })
      //if upload was successful, call getContent to get updated page
      if (data){
        getBucket(searchParams.get('id'))
      } 
      if (error){
        console.log(error)
      }
    }
  }

  //gets the content of the page/folder for the folders
  const getContent = async(path) =>{
    const { data, error } = await supabase.from('pages').select('content').eq('uuid', path)
    if (data){
      setContent(data[0].content)
    }
    else{
      console.log(error)
    }
  }

  //gets images in the bucket
  const getBucket = async (path) => {
    const {data, error} = await supabase.storage.from('images').list("public/" + path , {
      sortBy: { column: 'name', order: 'asc' },
    })
    if (data){
      setBucket(data)
    }
  }

  //creates a new folder in the pages database
  const newFolder = async () => {
    setDisplayPopUp(!displayPopUp)
    let currentPath = searchParams.get('id')
    const { data, error } = await supabase.from('pages').insert({owner: session.user.id, prev: currentPath, name: inputRef.current.value}).select()
    if (data){
      getContent(currentPath)
    }
    if (error){
      console.log(error)
    }
  }

  const deleteFolder = async () => {
    if (selected.length > 0){
      for (let i = 0; i < selected.length; i++){
        const { data, error } = await supabase.from('pages').delete().eq('uuid', selected[i]).select('*')
        if (data){
        }
        if (error){
          console.log(error)
        }
      }
      getContent(searchParams.get('id'))
    }
  }

  const deleteFile = async () => {
    console.log(fileSelected)
    const { data, error } = await supabase.storage.from('images').remove(fileSelected)
    if (data){
      getBucket(searchParams.get('id'))
    }
  }

  function deleteWrapper(){
    if (fileSelected.length != 0){
      deleteFile()
    }
    if (selected.length != 0){
      deleteFolder()
    }
  }

  function handleFolderSelect(item){
    if (selected.includes(item.path)){
      var filteredArray = selected.filter(function(e) { return e !== item.path })
      setSelected(filteredArray)
    }
    else{
      setSelected(oldArray=>[...oldArray, item.path])
    }
  }

  function handleFileSelect(item){
    if (fileSelected.includes('public/' + searchParams.get('id')+ '/' + item.name)){
      var filteredArray = fileSelected.filter(function(e) { return e !== 'public/' + searchParams.get('id')+ '/' + item.name })
      setFileSelected(filteredArray)
    }
    else{
      setFileSelected(oldArray=>[...oldArray, 'public/' + searchParams.get('id')+ '/' + item.name])
    }
  }

  const Folder = ({item}) => {
    return(
      <span className='folder'>
        {
          selected.includes(item.path) ? <GrCheckboxSelected onClick={()=>handleFolderSelect(item)} /> : <GrCheckbox onClick={()=>handleFolderSelect(item)} />
        }
        <span onDoubleClick={()=> navigate({pathname: '/', search: '?id='+ item.path})} key={item.path} className='item'>
          <span style={{padding: '5px'}}>{item.name}</span>
        </span>
      </span>
    )
  }

  const File = ({item}) => {
    return (
      <span className='file'>
        {
          fileSelected.includes('public/' + searchParams.get('id')+ '/' + item.name) ? <GrCheckboxSelected onClick={()=>handleFileSelect(item)} /> : <GrCheckbox onClick={()=>handleFileSelect(item)} />
        }
        <span style={{padding: '5px'}}>{item.name}</span>
        <span style={{padding: '5px'}}>{item.metadata.size}</span>
        <span style={{padding: '5px'}}>{item.metadata.lastModified}</span>
      </span>
    )
  }

  const PopUp = () => {
    return (
      <span style={{padding: '15px'}}>
        <input ref={inputRef}></input>
        <button onClick={()=>newFolder()}>Enter</button>
      </span>
    )
  }

  return (
    <div>
      <input type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
      <button onClick={()=>uploadStorage()}>Post</button>
      <button onClick={()=>setDisplayPopUp(!displayPopUp)}>New Folder</button>
      {
        displayPopUp ? <PopUp /> : <></>
      }
      {
        selected.length > 0 || fileSelected.length > 0 ?  <button onClick={()=>deleteWrapper()}>Delete</button> : <></>
      }
      <div>
        {
          content ? content.map((item, index)=>
            <Folder key={index} item = { item }/> 
          ) : <span></span>
        }
      </div>
      <div>
        {
          bucket ? bucket.map((item, index)=>
            <File key={index} item = {item}/>
          ) : <span></span>
        }
      </div>
    </div>
  )
}

//(auth.uid() = user_id)



//'[{"type" : "folder", "path" : "', new.uuid, '"name" : "',new.name,'"}]'