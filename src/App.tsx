import { HomePage } from "./pages/HomePage";
import { Digits } from "./components/Digits";
import { useMediaQuery } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from './lib/supabaseClient';
import Atheists from "./pages/Atheists";
import OtherChristians from "./pages/OtherChristians";
import FaithVitamins from "./pages/FaithVitamins";
import SavedTopics from "./pages/SavedTopics";
import { useEffect, useState } from "react";
import Logout from "./components/Logout";
import Auth from "./components/Auth";

export default function App() {
  /* Watches the width of the screen to rearrange the header. */
  const isMobile = useMediaQuery('(max-width:600px)');

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
            <Route path="/atheists" element={<Atheists />} />
            <Route path="/FaithVitamins" element={<FaithVitamins />} />
            <Route path="/otherchristians" element={<OtherChristians />} />
            <Route path="/SavedTopics" element={<SavedTopics />} />
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
