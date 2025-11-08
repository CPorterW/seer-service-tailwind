import { HomePage } from "./pages/HomePage";
import { Digits } from "./components/Digits";
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { useMediaQuery } from '@mui/material';
import Auth from './components/Auth';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Codes from "./pages/Codes";
import Vendors from "./pages/Vendors";
import Calculate from "./pages/Calculate";
import Clients from "./pages/Clients";
import Logout from "./components/Logout";


export default function App() {
  const [session, setSession] = useState<unknown>(null)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  
  /* Watches the width of the screen to rearrange the header. */
  const isMobile = useMediaQuery('(max-width:600px)');



  return (
    <div className="flex flex-col items-center justify-center">

      {!session ? (
        <Auth />
      ) : (
            <Router>
      {/* Navbar stays visible across all pages */}
      
          <header>
            <Digits toes={false} babyhands={isMobile} />
          </header>

      {/* Define page routes */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/codes" element={<Codes />} />
          <Route path="/calculate" element={<Calculate />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/logout" element={<Logout setSession={setSession} />} />
        </Routes>
      </div>
          <footer>
            <Digits toes={true} />
          </footer>
    </Router>
      )}
    </div>
  );
}
