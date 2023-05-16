import { supabase } from '../../supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import './Auth.css'

export default function Authentication(){
  return(
    <div style={{height: '100vh', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundImage: "url('https://farm6.staticflickr.com/5576/14958790671_70e7be5568_o_d.jpg')"}}>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Auth supabaseClient={supabase} appearance={{
          style:{
            button: {background: 'black', color: 'white', padding: '5px', border: '1px solid black', borderRadius: '10px'},
            input: {padding: '5px'},
        }}}
        providers={[]} />
      </div>
    </div>
  )
}
