import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

// создаём клиент Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [session, setSession] = useState(null)
  const [clients, setClients] = useState([])
  const [newClient, setNewClient] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn() {
    const email = prompt('Введите email для входа:')
    if (email) {
      await supabase.auth.signInWithOtp({ email })
      alert('Ссылка для входа отправлена на ' + email)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function loadClients() {
    const { data } = await supabase.from('CRM').select('*').order('created_at', { ascending: false })
    setClients(data || [])
  }

  async function addClient() {
    if (!newClient) return
    await supabase.from('CRM').insert({ full_name: newClient })
    setNewClient('')
    loadClients()
  }

  if (!session)
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2>Вход в CRM</h2>
        <button onClick={signIn}>Войти по email</button>
      </div>
    )

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
      <h2>CRM — Клиенты</h2>
      <button onClick={signOut} style={{ float: 'right' }}>Выйти</button>
      <div>
        <input
          value={newClient}
          onChange={(e) => setNewClient(e.target.value)}
          placeholder="Имя клиента"
        />
        <button onClick={addClient}>Добавить</button>
      </div>

      <hr />
      <button onClick={loadClients}>Обновить список</button>

      <ul>
        {clients.map((c) => (
          <li key={c.id}>{c.full_name}</li>
        ))}
      </ul>
    </div>
  )
}
