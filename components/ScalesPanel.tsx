
import React, { useMemo } from 'react';

type ScaleRec = { id:string; name:string; explanation:string }
const ALL_SCALES: Record<string,ScaleRec> = {
  VISA_P: { id:'VISA_P', name:'VISA-P (rotuliana)', explanation:'Cuestionario (0–100) para tendinopatía rotuliana: dolor y función.' },
  VISA_A: { id:'VISA_A', name:'VISA-A (Aquiles)', explanation:'Cuestionario (0–100) para tendinopatía aquílea.' },
  LEFS:   { id:'LEFS',   name:'LEFS', explanation:'Lower Extremity Functional Scale (0–80) para función de EEII.' },
  NDI:    { id:'NDI',    name:'NDI', explanation:'Neck Disability Index (0–50) para discapacidad cervical.' },
  ODI:    { id:'ODI',    name:'Oswestry', explanation:'Oswestry Disability Index (0–100%) para columna lumbar.' },
  SPADI:  { id:'SPADI',  name:'SPADI', explanation:'Shoulder Pain and Disability Index (0–100).' },
  DASH:   { id:'DASH',   name:'DASH', explanation:'Disabilities of the Arm, Shoulder and Hand (0–100).' },
  KOOS:   { id:'KOOS',   name:'KOOS Jr', explanation:'Knee injury and Osteoarthritis Outcome Score (0–100).' },
  FAAM:   { id:'FAAM',   name:'FAAM', explanation:'Foot and Ankle Ability Measure (0–100).' },
  HOOS:   { id:'HOOS',   name:'HOOS Jr', explanation:'Hip disability and Osteoarthritis Outcome Score (0–100).' },
}

export default function ScalesPanel({
  bodyRegion,
  values,
  onChange,
}:{
  bodyRegion?: string | null;
  values: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}){
  const recs = useMemo(()=>{
    const list: ScaleRec[] = []
    const r = (s:ScaleRec)=> list.find(x=>x.id===s.id)||list.push(s)
    if(!bodyRegion) return list
    const br = bodyRegion.toLowerCase()
    if(/hombro/.test(br)){ r(ALL_SCALES.SPADI); r(ALL_SCALES.DASH) }
    if(/rodilla/.test(br)){ r(ALL_SCALES.VISA_P); r(ALL_SCALES.KOOS); r(ALL_SCALES.LEFS) }
    if(/tobillo|pie/.test(br)){ r(ALL_SCALES.VISA_A); r(ALL_SCALES.FAAM); r(ALL_SCALES.LEFS) }
    if(/cadera/.test(br)){ r(ALL_SCALES.HOOS); r(ALL_SCALES.LEFS) }
    if(/cervical/.test(br)){ r(ALL_SCALES.NDI) }
    if(/lumbar/.test(br)){ r(ALL_SCALES.ODI) }
    // thorácica: podemos sugerir ODI si dolor de espalda, pero lo dejamos opcional
    if(/torácica/.test(br)){ r(ALL_SCALES.ODI) }
    return list
  }, [bodyRegion])

  function setScore(id:string, v:string){
    const num = v === '' ? '' : Number(v)
    onChange({ ...values, [`score_${id}`]: num })
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">Escalas recomendadas</h3>
      {recs.length === 0 ? <p className="text-sm text-gray-600">No hay sugerencias específicas para la zona seleccionada. Puedes registrar cualquier escala si lo ves útil.</p> : null}
      <div className="space-y-3">
        {recs.map(s=>(
          <div key={s.id} className="border rounded-xl p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-gray-600">{s.explanation}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Puntuación</label>
                <input className="w-24 border rounded-lg p-2" value={values[`score_${s.id}`] ?? ''} onChange={e=>setScore(s.id, e.target.value)} placeholder="0-100" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Puedes pasarla ahora o dejarla para otro momento. Si ya la has pasado en papel, registra la puntuación.</p>
          </div>
        ))}
      </div>
    </div>
  )
}
