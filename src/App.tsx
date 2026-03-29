import { Digits } from "./components/Digits";
import { lazy, Suspense, useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { useMediaQuery } from '@mui/material';
import Auth from './components/Auth';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
const HomePage = lazy(async () => {
  const module = await import("./pages/HomePage");
  return { default: module.HomePage };
});
const Codes = lazy(() => import("./pages/Codes"));
const Vendors = lazy(() => import("./pages/Vendors"));
const Calculate = lazy(() => import("./pages/Calculate"));
const Clients = lazy(() => import("./pages/Clients"));
const Logout = lazy(() => import("./components/Logout"));


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
    <div className="w-full">

      {!session ? (
        <Auth />
      ) : (
            <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar stays visible across all pages */}
        <header>
          <Digits toes={false} babyhands={isMobile} />
        </header>

        {/* Define page routes */}
        <main className="flex-1 p-6">
          <Suspense fallback={<p className="on-white">Loading...</p>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/codes" element={<Codes />} />
              <Route path="/calculate" element={<Calculate />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/logout" element={<Logout setSession={setSession} />} />
            </Routes>
          </Suspense>
        </main>
        <footer>
          <Digits toes={true} />
        </footer>
      </div>
    </Router>
      )}
    </div>
  );
}
