// pages/admin/index.tsx
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

type Role = 'admin' | 'fisio' | 'aux'

type StaffUserLite = {
  id: string
  name: string
  username: string
  email?: string
  role: Role
  active: boolean
  createdAt: string
}

type VisitLite = {
  id: string
  createdAt: string
  bodyRegion?: string
  intake?: any
}

export default function AdminHome() {
  const router = useRouter()
  const [me, setMe] = useState<{ username: string; role: Role } | null>(null)
  const [users, setUsers] = useState<StaffUserLite[]>([])
  const [visits, setVisits] = useState<VisitLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // 1) Asegurar que soy admin
        const who = await fetch('/api/whoami').then(r => r.json()).catch(() => null)
        if (!who?.user || who.user.role !== 'admin') {
          router.replace('/staff/login')
          return
        }
        if (mounted) setMe({ username: who.user.username, role: who.user.role })

        // 2) Equipo
        await refreshUsers(mounted)

        // 3) Visitas
        const v = await fetch('/api/visits').then(r => r.json()).catch(() => ({ ok: false, visits: [] }))
        if (mounted && v?.ok) setVisits(v.visits as VisitLite[])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [router])

  async function refreshUsers(mounted = true) {
    const j = await fetch('/api/admin/users').then(r => r.json()).catch(() => null)
    if (mounted && j?.ok) setUsers(j.users as StaffUserLite[])
  }

  async function handleDelete(username: string) {
    if (!confirm(`¿Eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) return

    // Evita borrarte a ti mismo desde el cliente (el servidor también lo valida)
    if (me?.username && me.username.toLowerCase() === username.toLowerCase()) {
      alert('No puedes eliminarte a ti mismo.')
      return
    }

    const r = await fetch(`/api/admin/users?username=${encodeURIComponent(username)}`, {
      method: 'DELETE',
    })
    const j = await r.json().catch(() => null)
    if (!r.ok || j?.ok === false) {
      alert(j?.error || 'No se pudo eliminar el usuario')
      return
    }
    await refreshUsers()
  }

  async function logout() {
    await fetch('/api/admin-auth/logout', { method: 'POST' }).catch(() => {})
    router.replace('/admin/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-700">
        Cargando…
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top bar */}
      <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
          <Link href="/" aria-label="Ir a la home" className="inline-flex">
            <Image src="/logo.svg" alt="Podium" width={120} height={30} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin/staff/new" className="px-3 py-2 rounded-lg bg-black text-white text-sm">
              Nuevo usuario
            </Link>
            <button onClick={logout} className="px-3 py-2 rounded-lg border text-sm">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold">Panel de administración</h1>

        {/* Equipo */}
        <section className="bg-white border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Equipo</h2>
            <Link href="/admin/staff/new" className="px-3 py-2 rounded-lg bg-black text-white text-sm">
              Nuevo usuario
            </Link>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-gray-600">Todavía no hay usuarios (aparte del admin inicial).</p>
          ) : (
            <ul className="divide-y">
              {users.map(u => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {u.name} <span className="text-xs text-gray-500">(@{u.username})</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      {u.email || 'sin email'} · Rol: {u.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 border">
                      {u.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <Link href={`/admin/staff/${encodeURIComponent(u.username)}`} className="text-sm underline">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(u.username)}
                      disabled={me?.username === u.username}
                      title={me?.username === u.username ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                      className={`text-sm underline ${
                        me?.username === u.username ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'
                      }`}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-gray-500 mt-2">
            * El servidor evita borrar el último administrador y también impide que te borres a ti mismo.
          </p>
        </section>

        {/* Pacientes / Visitas */}
        <section className="bg-white border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Pacientes / Visitas</h2>
            <Link href="/staff" className="text-sm underline">
              Ver como Staff
            </Link>
          </div>

          {visits.length === 0 ? (
            <p className="text-sm text-gray-600">Sin visitas aún.</p>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Visita</th>
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Región</th>
                    <th className="py-2 pr-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map(v => (
                    <tr key={v.id} className="border-b">
                      <td className="py-2 pr-4 font-mono">{v.id}</td>
                      <td className="py-2 pr-4">{new Date(v.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">{v.bodyRegion || '-'}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-3">
                          <Link href={`/report/${encodeURIComponent(v.id)}`} className="text-sm underline">
                            Ver informe
                          </Link>
                          <Link href={`/staff/visit/${encodeURIComponent(v.id)}`} className="text-sm underline">
                            Abrir en Staff
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
