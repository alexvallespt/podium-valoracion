// pages/staff/login.tsx
import { useRouter } from 'next/router'
import { useState } from 'react'
import Image from 'next/image'

export default function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const r = await fetch('/api/staff-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const j = await r.json()
    if (!r.ok || j.ok !== true) {
      setError(j.error || 'Error de login')
      return
    }
    router.push('/staff')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-neutral-900 p-6">
      <Image src="/logo.svg" alt="Podium" width={120} height={120} priority />
      <form onSubmit={submit} className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-5 mt-6 shadow">
        <h1 className="text-xl font-semibold mb-4">Acceso staff</h1>

        <label className="block text-sm mb-1">Email</label>
        <input
          className="w-full border rounded-lg p-3 mb-3 bg-white"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <label className="block text-sm mb-1">Contraseña</label>
        <input
          type="password"
          className="w-full border rounded-lg p-3 mb-4 bg-white"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button type="submit" className="w-full py-3 rounded-xl bg-black text-white">
          Entrar
        </button>
      </form>
    </main>
  )
}
