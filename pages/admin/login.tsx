// pages/admin/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Por si hay una sesión de staff abierta, la cerramos
      await fetch('/api/staff-auth/logout', { method: 'POST' }).catch(() => {})

      const res = await fetch('/api/admin-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const j = await res.json().catch(() => ({}))

      if (!res.ok || j?.ok === false) {
        setError(j?.error || 'Credenciales no válidas')
        setLoading(false)
        return
      }

      // ✅ Ir al panel de administración
      router.replace('/admin')
    } catch {
      setError('Error de red. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <main className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image src="/logo.svg" alt="Podium" width={140} height={36} />
          </Link>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-white border rounded-2xl p-5">
          <h1 className="text-lg font-semibold">Acceso administrador</h1>

          <label className="block text-sm">
            <span className="text-gray-700">Usuario</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="text-gray-700">Contraseña</span>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-semibold"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="text-xs text-gray-500 text-center">
            ¿Eres del equipo?{' '}
            <Link href="/staff/login" className="underline">
              Acceso staff
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}