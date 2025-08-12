// pages/staff/visit/[id].tsx
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import AnamnesisView from '../../../components/AnamnesisView'

type DDX = { label: string; prob: number; why?: string }
type PatientLite = { firstName?: string; lastName?: string }
type Visit = {
  id: string
  createdAt?: number
  bodyRegion?: string
  patient?: PatientLite
  intake?: Record<string, unknown>
  ddxJSON?: { ddx: DDX[] }
}

export default function StaffVisit() {
  const router = useRouter()
  const { id } = router.query
  const visitId = typeof id === 'string' ? id : ''

  const [loading, setLoading] = useState(true)
  const [visit, setVisit] = useState<Visit | null>(null)
  const [me, setMe] = useState<{ user?: { username: string; role?: string } } | null>(null)

  const loadData = useCallback(async () => {
    if (!visitId) return
    setLoading(true)
    try {
      // 1) Comprueba sesión de staff
      const who = await fetch('/api/whoami').then((r) => r.json())
      if (!who?.user) {
        router.replace('/staff/login')
        return
      }
      setMe(who)

      // 2) Carga la visita
      const res = await fetch(`/api/visit?id=${encodeURIComponent(visitId)}`)
      if (!res.ok) {
        setVisit(null)
      } else {
        const j = await res.json()
        setVisit((j?.visit || null) as Visit | null)
      }
    } catch {
      setVisit(null)
    } finally {
      setLoading(false)
    }
  }, [router, visitId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  async function logout() {
    await fetch('/api/staff-logout', { method: 'POST' })
    router.push('/staff/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        Cargando…
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        {/* Header */}
        <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
            <Link href="/staff" className="text-sm underline">← Volver al panel</Link>
            <div className="flex items-center gap-3">
              {me?.user?.username && (
                <span className="text-xs text-gray-600 hidden sm:inline">
                  @{me.user.username}{me.user.role ? ` · ${me.user.role}` : ''}
                </span>
              )}
              <button onClick={logout} className="px-3 py-2 rounded-lg border text-sm">Salir</button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-4">
          <div className="bg-white border rounded-2xl p-6">
            <p className="text-gray-700">No se encontró la visita solicitada.</p>
          </div>
        </main>
      </div>
    )
  }

  const fullName = [visit.patient?.firstName, visit.patient?.lastName].filter(Boolean).join(' ') || 'Paciente'
  const fecha = visit.createdAt ? new Date(visit.createdAt).toLocaleString() : '—'
  const ddx = visit.ddxJSON?.ddx || []

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Link href="/staff" className="text-sm underline">← Volver al panel</Link>
            <Link href="/" aria-label="Home" className="hidden sm:flex items-center gap-2">
              <Image src="/logo.svg" alt="Podium" width={100} height={26} priority />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {me?.user?.username && (
              <span className="text-xs text-gray-600 hidden sm:inline">
                @{me.user.username}{me.user.role ? ` · ${me.user.role}` : ''}
              </span>
            )}
            <button onClick={logout} className="px-3 py-2 rounded-lg border text-sm">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Tarjeta resumen visita */}
        <div className="bg-white border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Anamnesis — {fullName}
              </h1>
              <p className="text-sm text-gray-600">
                Visita <span className="font-mono">{visit.id}</span> · Fecha: {fecha}
              </p>
              <p className="text-sm text-gray-600">Zona: {visit.bodyRegion || '—'}</p>
            </div>
            <Link
              href={`/exam/${encodeURIComponent(visit.id)}`}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm shrink-0 self-start"
            >
              Iniciar evaluación
            </Link>
          </div>

          {ddx.length > 0 && (
            <div className="mt-4">
              <p className="font-medium text-sm mb-2">Hipótesis IA (Top-3):</p>
              <ul className="space-y-2">
                {ddx.map((d, i) => (
                  <li key={`${d.label}-${i}`} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>{i + 1}. {d.label}</span>
                      <span className="font-mono">{Math.round(d.prob)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded mt-1">
                      <div
                        className="h-2 bg-black rounded"
                        style={{ width: `${Math.max(0, Math.min(100, d.prob))}%` }}
                      />
                    </div>
                    {d.why && <p className="text-xs text-gray-600 mt-1">{d.why}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Vista de la anamnesis completa */}
        <AnamnesisView data={visit.intake} />

        {/* Acciones inferiores */}
        <div className="flex gap-3 justify-end">
          <Link
            href={`/exam/${encodeURIComponent(visit.id)}`}
            className="px-4 py-3 rounded-xl bg-black text-white"
          >
            Iniciar evaluación
          </Link>
        </div>
      </main>
    </div>
  )
}
