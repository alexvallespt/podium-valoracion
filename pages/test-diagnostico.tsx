import { useState } from 'react'

type DDX = { label:string; prob:number; why:string; segment_focus?:string }

export default function TestDiagnostico() {
  const [anamnesis, setAnamnesis] = useState(
    'Añade aquí la anamnesis.'
  )
  const [ddx, setDdx] = useState<DDX[]|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  async function enviar(){
    setLoading(true); setError(null); setDdx(null)
    try{
      const res = await fetch('/api/openai-diagnostico',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ anamnesis })
      })
      const data = await res.json()
      if(!data.ok) throw new Error(data.error||'Error desconocido')
      setDdx(data.ddx)
    }catch(e:any){ setError(e.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-3">Prueba de Diagnóstico IA</h1>
      <textarea
        className="w-full border rounded-xl p-3 mb-3"
        rows={6}
        value={anamnesis}
        onChange={e=>setAnamnesis(e.target.value)}
        placeholder="Pega aquí la anamnesis…"
      />
      <button
        onClick={enviar}
        disabled={loading || !anamnesis.trim()}
        className="px-4 py-3 rounded-xl bg-black text-white font-semibold"
      >
        {loading?'Procesando…':'Enviar a IA'}
      </button>

      {error && <p className="mt-3 text-red-600">Error: {error}</p>}

      {ddx && (
        <div className="mt-5 space-y-3">
          {ddx.map((d, i)=>(
            <div key={i} className="border rounded-xl p-3 bg-white shadow">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{i+1}. {d.label}</p>
                <span className="text-sm">{d.prob}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded mt-1">
                <div className="h-2 bg-black rounded" style={{ width: `${Math.max(0, Math.min(100, d.prob))}%` }} />
              </div>
              <p className="text-sm text-gray-700 mt-2">{d.why}</p>
              {d.segment_focus && <p className="text-xs text-gray-500 mt-1">Segmento foco: {d.segment_focus}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
