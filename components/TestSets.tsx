
import React from 'react';

type T = { key:string; label:string }

export function TestChecklist({
  title,
  tests,
  values,
  onChange
}:{
  title:string;
  tests: T[];
  values: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}){
  function setKV(k:string, v:any){
    onChange({ ...values, [k]: v })
  }
  function setPain(k:string, v:number|string){
    const num = v === '' ? '' : Number(v)
    onChange({ ...values, [`${k}_pain`]: num })
  }
  function toggle(k:string, v:string){
    const cur = values[k]
    setKV(k, cur === v ? '' : v)
  }
  const RESULT_OPTS = ['Positivo','Negativo','No concluyente','No realizado']

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {tests.map(t=>{
          const val = values[t.key] ?? ''
          const pain = values[`${t.key}_pain`] ?? ''
          return (
            <div key={t.key} className="border rounded-xl p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="font-medium text-sm">{t.label}</div>
                <div className="btn-wrap">
                  {RESULT_OPTS.map(opt=>{
                    const active = val === opt
                    return (
                      <button type="button" key={opt} onClick={()=>toggle(t.key,opt)} className={`btn ${active?'btn-active':''}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">Dolor (0–10):</span>
                <div className="btn-wrap">
                  {[0,2,4,6,8,10].map(n=>(
                    <button type="button" key={n} onClick={()=>setPain(t.key,n)} className={`btn ${pain===n?'btn-active':''}`}>{n}</button>
                  ))}
                </div>
                <input
                  className="border rounded-lg p-2 w-24"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Otro"
                  value={pain}
                  onChange={e=>setPain(t.key, e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
          )
        })}
      </div>
      <style jsx global>{`
        .btn-wrap { display:flex; flex-wrap:wrap; gap:8px; }
        .btn { border:1px solid #e5e7eb; border-radius:12px; padding:12px 14px; background:#f9fafb; font-size:16px; }
        .btn-active { background:black; color:white; border-color:black; }
      `}</style>
    </div>
  )
}
