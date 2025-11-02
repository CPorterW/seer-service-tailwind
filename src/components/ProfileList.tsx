import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Profile = {
  id: string
  username: string
  updated_at: string
}

export default function ProfileList() {
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) console.error('Error:', error)
      else setProfiles(data ?? [])
    }

    loadProfiles()
  }, [])

  return (
    <ul>
      {profiles.map((p) => (
        <li key={p.id}>{p.username}</li>
      ))}
    </ul>
  )
}
