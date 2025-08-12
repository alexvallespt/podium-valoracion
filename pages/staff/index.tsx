// pages/staff/index.tsx
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

type VisitRow = { id: string; intake?: any; createdAt?: number }

export default function StaffHome() {
  const [loading, setLoading] = useState(true)
  const [visits, setVisits] = useState<VisitRow[]>([])
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      const me = await fetch('/api/whoami').then(r => r.json())
      if (!me?.user) {
        router.replace('/staff/login')
        return
      }
      const v = await fetch('/api/visits').then(r => r.json())
      setVisits(v?.visits || [])
      setLoading(false)
    })()
  }, [router])

  async function logout() {
    await fetch('/api/staff-auth/logout', { method: 'POST' })
    router.replace('/staff/login')
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center">Cargando…</main>

  return (
    <main className="min-h-screen bg-white text-neutral-900 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Image src="/logo.svg" alt="Podium" width={120} height={120} />
        <button onClick={logout} className="px-3 py-2 rounded-lg border">Salir</button>
      </div>

      <h1 className="text-2xl font-semibold mb-4">Visitas</h1>
      <div className="grid gap-3">
        {visits.map(v => (
          <div key={v.id} className="p-4 rounded-xl border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Visita {v.id}</p>
                <p className="text-sm text-gray-600">{v.intake?.q1_nombre || 'Sin nombre'}</p>
              </div>
              <Link href={`/exam/${v.id}`} className="px-4 py-2 rounded-lg bg-black text-white">
                Abrir evaluación
              </Link>
            </div>
          </div>
        ))}
        {visits.length === 0 && <p className="text-gray-600">Aún no hay visitas.</p>}
      </div>
    </main>
  )
}
