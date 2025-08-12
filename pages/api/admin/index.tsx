// pages/admin/index.tsx
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

type UserRow = { username: string; role: 'admin' | 'staff' }

export default function AdminHome() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserRow[]>([])
  const [me, setMe] = useState<{ user?: { username: string; role?: string } } | null>(null)
  const [error, setError] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // Verifica sesión y rol desde el mismo whoami usado en staff
      const who = await fetch('/api/whoami').then(r => r.json())
      if (!who?.user) {
        router.replace('/admin/login')
        return
      }
      if (who.user.role !== 'admin') {
        router.replace('/staff') // si no es admin, al panel de staff
        return
      }
      setMe(who)

      // Carga usuarios
      const u = await fetch('/api/admin/users').then(r => r.json())
      if (!u?.ok) throw new Error(u?.error || 'No se pudieron cargar los usuarios')
      setUsers(u.users || [])
    } catch (e: any) {
      setError(e?.message || 'Error de carga')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  async function logout() {
    await fetch('/api/staff-logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  async function onDelete(username: string) {
    const sure = confirm(`¿Eliminar al usuario "${username}"? Esta acción cierra sus sesiones activas.`)
    if (!sure) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const j = await res.json()
    if (!res.ok || !j?.ok) {
      alert(j?.error || 'No se pudo eliminar')
      return
    }
    setUsers(prev => prev.filter(u => u.username !== username))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        Cargando…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Home" className="hidden sm:flex items-center gap-2">
              <Image src="/logo.svg" alt="Podium" width={110} height={28} priority />
            </Link>
            <span className="font-semibold">Panel administrador</span>
          </div>
          <div className="flex items-center gap-3">
            {me?.user?.username && (
              <span className="text-xs text-gray-600 hidden sm:inline">
                @{me.user.username} · admin
              </span>
            )}
            <button onClick={logout} className="px-3 py-2 rounded-lg border text-sm">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {error && (
          <div className="p-3 rounded-lg border border-red-300 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Usuarios del equipo</h1>
          <Link
            href="/admin/new-user"
            className="px-3 py-2 rounded-lg bg-black text-white text-sm"
          >
            Nuevo usuario
          </Link>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Usuario</th>
                <th className="text-left p-3">Rol</th>
                <th className="text-right p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.username} className="border-t">
                  <td className="p-3 font-mono">{u.username}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onDelete(u.username)}
                        className="px-3 py-1.5 rounded-lg border text-red-600"
                        title="Eliminar usuario"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-600">
                    No hay usuarios creados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          Consejo: crea al menos otro usuario administrador para no quedarte sin acceso.
        </p>
      </main>
    </div>
  )
}
