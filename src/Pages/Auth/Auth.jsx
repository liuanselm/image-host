import { supabase } from '../../supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import './Auth.css'

export default function Authentication(){
  return(
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <Auth supabaseClient={supabase} appearance={{
        style:{
          button: {background: 'black', color: 'white', padding: '5px', border: '1px solid black', borderRadius: '10px'},
          input: {padding: '5px'},
      }}}
      providers={[]} />
    </div>
  )
}
