import { useEffect, useMemo, useState } from 'react'

function makeVisitId() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `VIS${stamp}-${rand}`
}

// Normaliza a formato wa.me: solo dígitos y con prefijo país (por defecto 34 ES)
function normalizeToWa(phoneRaw: string, defaultCountry = '34') {
  const digits = (phoneRaw || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.length === 9) return defaultCountry + digits
  if (digits.startsWith(defaultCountry)) return digits
  if (digits.startsWith('00')) return digits.slice(2)
  return digits
}

export default function WhatsAppPage(){
  // Evitar SSR mismatch: todo lo que cambie se calcula tras montado
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{ setMounted(true) }, [])

  const [clinic, setClinic] = useState('Clínica Podium')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // visitId vacío en SSR; lo generamos al montar
  const [visitId, setVisitId] = useState('')
  useEffect(()=>{ if(!visitId) setVisitId(makeVisitId()) }, [visitId])

  // Base URL: preferimos la de .env; si no hay, usamos window.location.origin tras montar
  const [appUrl, setAppUrl] = useState(process.env.NEXT_PUBLIC_APP_URL || '')
  useEffect(()=>{
    if(!appUrl && typeof window !== 'undefined'){
      setAppUrl(window.location.origin)
    }
  }, [appUrl])

  // Derivados SOLO cuando está montado (evita hidratar HTML diferente)
  const intakeUrl = mounted && visitId ? `${appUrl}/intake?visitId=${encodeURIComponent(visitId)}` : ''
  const waNumber  = mounted ? normalizeToWa(phone, '34') : ''

  const message = mounted ? `Hola ${name || '👋'}, te damos la bienvenida a ${clinic}.
Para preparar tu primera visita, por favor completa este breve cuestionario previo:
${intakeUrl}

Nos ayuda a entender tu caso y personalizar tu valoración para darte el mejor servicio. Gracias por dedicar unos minutos, en un lugar tranquilo, para rellenarlo.

Si tienes cualquier duda, puedes responder a este WhatsApp.
¡Nos vemos pronto!` : ''

  const waUrl = mounted && waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}` : ''

  async function copy(text: string){
    try{ await navigator.clipboard.writeText(text); alert('Copiado al portapapeles') }
    catch{ alert('No se pudo copiar automáticamente. Copia manualmente, por favor.') }
  }

  function openWa(){
    if(!waNumber){ alert('Revisa el teléfono (incluye prefijo país o usa un número español).'); return }
    window.open(waUrl, '_blank')
  }

  function regenerateId(){ setVisitId(makeVisitId()) }

  // Placeholder en SSR para que el HTML coincida
  if(!mounted){
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-5">
          <h1 className="text-xl font-bold">Enviar WhatsApp de bienvenida</h1>
          <p className="text-sm text-gray-500">Cargando…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-5 space-y-4">
        <h1 className="text-xl font-bold">Enviar WhatsApp de bienvenida</h1>
        <p className="text-sm text-gray-600">
          Personaliza el mensaje y abre WhatsApp con el texto listo. El enlace incluye un <strong>código de visita</strong> único para la anamnesis.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Nombre del paciente</span>
            <input
              value={name} onChange={e=>setName(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
              placeholder="Ej. María López"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Teléfono (con o sin prefijo)</span>
            <input
              value={phone} onChange={e=>setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
              placeholder="Ej. 612345678 o +34612345678"
              inputMode="tel"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si es número español, puedes escribir solo 9 dígitos; añadiremos el +34 automáticamente.
            </p>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">Código de visita</span>
              <input
                value={visitId} onChange={e=>setVisitId(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
              />
              <p className="text-xs text-gray-500 mt-1">Este ID aparecerá en la URL de la anamnesis.</p>
            </label>
            <button type="button" onClick={regenerateId}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold">
              Nuevo ID
            </button>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Nombre de la clínica/remitente</span>
            <input
              value={clinic} onChange={e=>setClinic(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/50"
              placeholder="Ej. Clínica Podium"
            />
          </label>

          <div className="bg-gray-50 rounded-xl p-3 border">
            <p className="text-xs font-medium text-gray-600 mb-1">Vista previa del mensaje</p>
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border">
            <p className="text-xs font-medium text-gray-600 mb-1">Enlace a la anamnesis</p>
            <a href={intakeUrl} target="_blank" className="text-sm underline break-all">{intakeUrl}</a>
            <div className="mt-2 flex gap-2">
              <button type="button" className="px-3 py-1.5 rounded-lg border" onClick={()=>copy(intakeUrl)}>Copiar enlace</button>
              <button type="button" className="px-3 py-1.5 rounded-lg border" onClick={()=>copy(message)}>Copiar mensaje</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              Al enviar, confirmas que tienes consentimiento del paciente para contactar por WhatsApp.
            </div>
            <button
              type="button"
              onClick={openWa}
              disabled={!waNumber}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
            >
              Abrir WhatsApp con el mensaje
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
