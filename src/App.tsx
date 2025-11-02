import { HomePage } from "./pages/HomePage";
import { Digits } from "./components/Digits";
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { useMediaQuery } from '@mui/material';
import Auth from './components/Auth';
import ProfileList from './components/ProfileList';


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
        <>
          <header>
            <Digits toes={false} babyhands={isMobile} />
          </header>
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          <ProfileList />
          <HomePage />
          <footer>
            <Digits toes={true} />
          </footer>
        </>
      )}
    </div>
  );
}
