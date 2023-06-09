import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr';
import { FcFolder, FcImageFile } from 'react-icons/fc'
import { AiOutlineUpload, AiOutlineFolderAdd, AiOutlineDelete, AiOutlineSearch, AiOutlineClose } from 'react-icons/ai'
import { BsGrid3X2Gap } from 'react-icons/bs'
import { ImRadioUnchecked, ImRadioChecked} from 'react-icons/im'
import { CgProfile } from 'react-icons/cg'

import './Home.css'

export default function Home({ session }) {
  const [loading, setLoading] = useState(true)

  const [image, setImage] = React.useState([])
  const [bucket, setBucket] = React.useState(null)
  const [content, setContent] = React.useState(null)
  const [selected, setSelected] = React.useState([])
  const [fileSelected, setFileSelected] = React.useState([])
  const [history, setHistory] = React.useState(null)
  const [displayPopUp, setDisplayPopUp] =  React.useState(false)
  const [displayImagePopUp, setDisplayImagePopUp] = React.useState(false)
  const [downloadedImage, setDownloadedImage] = React.useState({})
  const [displayProfile, setDisplayProfile] = React.useState(false)
  const [listView, setListView] = React.useState(true)

  const inputRef = React.useRef();
  const fileRef = React.useRef();
  const newFolderRef = React.useRef();
  const searchRef = React.useRef();
  const newFolderEnterRef = React.useRef();

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

  useEffect(()=>{
    uploadStorage()
  },[image])

  const signout = async () => {
    const { error } = await supabase.auth.signOut()
    navigate({pathname: '/'})
    window.location.reload(false);
  }

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
    const { data, error } = await supabase.from('pages').select('*').eq('uuid', path)
    if (data){
      setContent(data[0])
    }
    else{
      console.log(error)
    }
  }

  //gets images in the bucket
  const getBucket = async (path, order='asc') => {
    const {data, error} = await supabase.storage.from('images').list("public/" + path , {
      sortBy: { column: 'name', order: order },
    })
    if (data){
      setBucket(data)
    }
  }

  //creates a new folder in the pages database
  const newFolder = async () => {
    if (inputRef.current.value != null || inputRef.current.value != ''){
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

  const downloadFile = async (path) => {
    const { data, error } = await supabase.storage.from('images').getPublicUrl(path)
    if (data){
      console.log(data)
      setDownloadedImage(data)
    }
  }

  const downloadFileSync = (path) => {
    const { data, error } = supabase.storage.from('images').getPublicUrl(path)
    if (data){
      return data.publicUrl
    }
  }

  const searchFile = async (path) => {
    const { data, error } = await supabase.storage.from('images').list(path, {
      sortBy: {column: 'name', order: 'asc'},
      search: searchRef.current.value
    })
    if (data){
      setBucket(data)
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
      <span style={selected.includes(item.path) ? {backgroundColor: '#F0F8FF'} : {backgroundColor: 'white'}} onContextMenu={(e)=>e.preventDefault()} onDoubleClick={()=> navigate({pathname: '/', search: '?id='+ item.path})} className='folder'>
        <span className='folderleft'>
          {
            selected.includes(item.path) ? <ImRadioChecked onClick={()=>handleFolderSelect(item)} /> : <ImRadioUnchecked onClick={()=>handleFolderSelect(item)} />
          }
          <FcFolder className='foldericon' size={28}/>
          <span className='foldername'>{item.name}</span>
        </span>
      </span>
    )
  }

  const File = ({item}) => {
    return (
      <span onDoubleClick={()=>{downloadFile('public/' + searchParams.get('id')+ '/' + item.name); setDisplayImagePopUp(!displayImagePopUp)}} className='file' style={fileSelected.includes('public/' + searchParams.get('id')+ '/' + item.name) ? {backgroundColor: '#F0F8FF'} : {backgroundColor: 'white'}}>
        <span className='fileleft'>
          {
            fileSelected.includes('public/' + searchParams.get('id')+ '/' + item.name) ? <ImRadioChecked onClick={()=>handleFileSelect(item)} /> : <ImRadioUnchecked onClick={()=>handleFileSelect(item)} />
          }
          <FcImageFile className='fileicon' size={28}/>
          <span className='filename'>{item.name}</span>
        </span>
        <span style={{padding: '5px'}}>{item.metadata.size}</span>
        <span style={{padding: '5px'}}>{item.metadata.lastModified}</span>
      </span>
    )
  }

  const FileTile = ({item}) => {
    return(
      <div className='tileimagewrapper'>
        <img style={{maxHeight:'100px', maxWidth: 'auto', margin: '10px'}} src={downloadFileSync('public/' + searchParams.get('id') + '/' + item.name)}></img>
        <div style={{textAlign: 'center'}}>{item.name}</div>
      </div>
    )
  }

  const PopUp = () => {
    return (
      <div className='overlaynewfolder'>
        <div className='newfolderpopup'>
          <AiOutlineClose onClick={()=>setDisplayPopUp(!displayPopUp)} className='newfoldercloseoverlay'/>
          <form className='newfolderform'>
            <input style={{padding: '5px'}} placeholder='New folder name...' ref={inputRef}></input>
            <div className='newfoldercreatebutton' onClick={()=>newFolderEnterRef.current.click()}>Create</div>
            <button ref={newFolderEnterRef} style={{display: 'none'}} onClick={()=>newFolder()}>Enter</button>
          </form>
        </div>
      </div>
    )
  }

  const DisplayImage = () => {
    return(
      <div onClick={()=>setDisplayImagePopUp(!displayImagePopUp)} className='overlay'>
        <AiOutlineClose onClick={()=>setDisplayImagePopUp(!displayImagePopUp)} className='closeoverlay'/>
        <img className='overlayimage' src={downloadedImage.publicUrl}></img>
      </div>
    )
  }

  const Header = () => {
    return(
      <div className='header'>
        <div style={{color: 'white'}}>File Host</div>
        <form className='searchform'>
          <input ref={searchRef} className='searchinput' type="search" placeholder="Search..."></input>
          <button onClick={()=>searchFile('public/' + searchParams.get('id'))} type='button' className='searchbutton'>Search</button>
        </form>
        <div className='headerprofile'>
          <CgProfile size={28} color='white' onClick={()=>setDisplayProfile(!displayProfile)}/>
          {
            displayProfile ? <div className='profilemenu'>
              <div onClick={()=>signout()}>Sign Out</div>
            </div> : null
          }
        </div>
      </div>
    )
  }

  const Actions = () => {
    return(
      <div className='actionWrapper'>
        <div className='uploadbutton' onClick={()=>fileRef.current.click()}>
          <AiOutlineUpload size={28}/>
          <div>Upload</div>
        </div>
        <div className='uploadbutton' onClick={()=>newFolderRef.current.click()}>
          <AiOutlineFolderAdd size={28}/>
          <div>New Folder</div>
        </div>
        <div className='uploadbutton'>
          <BsGrid3X2Gap onClick={()=>setListView(!listView)} size={28}/>
        </div>
        <input style={{display:"none"}} ref={fileRef} type="file" multiple="multiple" accept=".jpg,.jpeg,.png" onChange={(e)=>setImage(e.target.files)}></input>
        <button style={{display:"none"}} ref={newFolderRef} onClick={()=>setDisplayPopUp(!displayPopUp)}>New Folder</button>
        {
          displayPopUp ? <PopUp /> : <></>
        }
        {
          (selected.length > 0 || fileSelected.length > 0) && <div className='uploadbutton' onClick={()=>deleteWrapper()}>
            <AiOutlineDelete size={28}/>
            <div>Delete</div>
          </div>
        }
      </div>
    )
  }
  const Content = () => {
    return(
      <div className='contentWrapper'>
        <div className='labelWrapper'>
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
        </div>
        <div>
          {
            content ? content.content.map((item, index)=>
              <Folder key={index} item = { item }/> 
            ) : <span></span>
          }
        </div>
        <div style={!listView ? {display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'} : null}>
          {
            (bucket && listView) ? bucket.map((item, index)=>
              <File key={index} item = {item}/>
            ) : (bucket && !listView) ? bucket.map((item, index)=> <FileTile key={index} item = {item}/>) : null
          }
        </div>
      </div>
    )
  }

  return (
    <div>
      {
        displayImagePopUp ? <DisplayImage /> : null
      }
      <Header />
      <Actions />
      <Content />
    </div>
  )
}

//(auth.uid() = user_id)



//'[{"type" : "folder", "path" : "', new.uuid, '"name" : "',new.name,'"}]'