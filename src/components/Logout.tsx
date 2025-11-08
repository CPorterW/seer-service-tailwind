// Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabaseClient';

export default function Logout({ setSession }: { setSession: (s: boolean) => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session or tokens
    setSession(false);
    supabase.auth.signOut()
    // Redirect to login or home
    navigate("/", { replace: true });
  }, [navigate, setSession]);

  return null; // nothing to render
}