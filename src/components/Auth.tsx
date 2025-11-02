import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      console.log('Signed in:', data)
    }

    setLoading(false)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      console.log('Signed up:', data)
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '420px', margin: '50px auto' }}>
      <h2>Sign In / Sign Up</h2>
      <form>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />

        <button onClick={handleSignIn} disabled={loading}>
          {loading ? 'Loading…' : 'Sign In'}
        </button>
        <button onClick={handleSignUp} disabled={loading}>
          {loading ? 'Loading…' : 'Sign Up'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
