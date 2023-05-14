import './App.css';
import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react'

import Auth from './Pages/Auth/Auth'
import Account from './Pages/Account/Account'
import Home from './Pages/Home/Home'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [session, setSession] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  
    supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'SIGN_OUT') {
        setSession(null)
      }
    })
  }, [])

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? <Auth /> : <Home key={session.user.id} session={session} />}
    </div>
  );
}

export default App;

/*
<div className="container" style={{ padding: '50px 0 100px 0' }}>
  {!session ? <Auth /> : <Home key={session.user.id} session={session} />}
</div>

*/