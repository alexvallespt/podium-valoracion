
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function ReportView(){
  const { query } = useRouter()
  const [visit, setVisit] = useState<any>(null)

  useEffect(()=>{
    async function load(){
      if(!query.visitId) return
      const r = await fetch(`/api/visit?id=${query.visitId}`)
      const j = await r.json()
      setVisit(j.visit)
    }
    load()
  }, [query.visitId])

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Informe – {visit?.patient?.firstName} {visit?.patient?.lastName}</h1>
      <p className="text-sm text-gray-600">Zona: {visit?.bodyRegion || '—'}</p>
      {visit?.report ? (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">Resumen</h3>
          <pre className="whitespace-pre-wrap text-sm">{visit.report.summaryMD}</pre>
          <h3 className="font-semibold mt-4 mb-2">Mensaje enviado al paciente</h3>
          <pre className="whitespace-pre-wrap text-sm">{visit.report.patientBrief}</pre>
        </div>
      ) : <p className="text-sm">Aún no se ha generado el informe.</p>}
    </div>
  )
}
