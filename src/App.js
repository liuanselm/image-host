import './App.css';
import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react'

import Auth from './Pages/Auth/Auth'
import Account from './Pages/Account/Account'
import Home from './Pages/Home/Home'

function App() {
  const [session, setSession] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? <Auth /> : <Home key={session.user.id} session={session} />}
    </div>
  );
}

export default App;
