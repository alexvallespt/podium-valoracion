
import React from 'react';

type Row = { key:string; label:string; refMin?:number; refMax?:number }
export default function NumericTable({
  title, rows, values, onChange, sideLabels = ['Izq','Der']
}:{
  title:string;
  rows: Row[];
  values: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
  sideLabels?: [string,string] | string[];
}){
  function setVal(rowKey:string, side:'L'|'R', v:string|number){
    const key = `${rowKey}_${side}`
    const num = v === '' ? '' : Number(v)
    onChange({ ...values, [key]: num })
  }
  function step(rowKey:string, side:'L'|'R', delta:number){
    const key = `${rowKey}_${side}`
    const cur = Number(values[key] ?? 0)
    const next = isNaN(cur) ? delta : cur + delta
    onChange({ ...values, [key]: Math.max(-999, Math.min(999, next)) })
  }
  function asym(rowKey:string){
    const L = Number(values[`${rowKey}_L`] ?? NaN)
    const R = Number(values[`${rowKey}_R`] ?? NaN)
    if(Number.isNaN(L) || Number.isNaN(R)) return ''
    if(L === 0 && R === 0) return '0%'
    const maxV = Math.max(L,R)
    const minV = Math.min(L,R)
    const pct = maxV ? Math.round(((maxV - minV) / maxV) * 100) : 0
    const side = L>R? sideLabels[0] : (R>L? sideLabels[1] : '—')
    return `${pct}% ${side}`
  }
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Movimiento</th>
              <th className="py-2">{sideLabels[0]}</th>
              <th className="py-2">{sideLabels[1]}</th>
              <th className="py-2">Asimetría</th>
              <th className="py-2">Ref.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>{
              const ref = r.refMin!=null || r.refMax!=null ? `${r.refMin ?? ''}${r.refMin!=null?'–':''}${r.refMax ?? ''}`: ''
              return (
                <tr key={r.key} className="border-b last:border-0">
                  <td className="py-2">{r.label}</td>
                  {(['L','R'] as const).map(side=>{
                    const key = `${r.key}_${side}`
                    const val = values[key] ?? ''
                    return (
                      <td key={side} className="py-2">
                        <div className="flex items-center gap-2">
                          <button type="button" className="btn" onClick={()=>step(r.key, side, -1)}>-</button>
                          <input inputMode="decimal" className="w-24 border rounded-lg p-3 text-center text-base" value={val} onChange={e=>setVal(r.key, side, e.target.value)} />
                          <button type="button" className="btn" onClick={()=>step(r.key, side, +1)}>+</button>
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-2">{asym(r.key)}</td>
                  <td className="py-2 text-gray-500">{ref}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .btn { border:1px solid #e5e7eb; border-radius:10px; padding:8px 12px; background:#f9fafb; }
      `}</style>
    </div>
  )
}
