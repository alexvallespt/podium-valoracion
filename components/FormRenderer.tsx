
import React from 'react';

export type Field =
  | { id: string; label: string; type: 'text' | 'textarea' | 'number' | 'date' | 'scale' | 'yesno'; placeholder?: string; min?: number; max?: number; step?: number; required?: boolean; showIf?: (values: Record<string, any>) => boolean }
  | { id: string; label: string; type: 'select'; options: string[]; required?: boolean; showIf?: (values: Record<string, any>) => boolean }
  | { id: string; label: string; type: 'multi'; options: string[]; required?: boolean; showIf?: (values: Record<string, any>) => boolean };

export type Section = { id: string; title: string; description?: string; fields: Field[] };

export default function FormRenderer({
  sections,
  values,
  onChange,
}: {
  sections: Section[];
  values: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}) {
  function set(id: string, v: any) {
    onChange({ ...values, [id]: v });
  }

  function toggleMulti(id: string, option: string) {
    const arr = Array.isArray(values[id]) ? [...values[id]] : [];
    const idx = arr.indexOf(option);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(option);
    set(id, arr);
  }

  function setSingle(id: string, option: string) {
    set(id, option);
  }

  return (
    <div className="space-y-6">
      {sections.map((sec) => {
        const visibleFields = sec.fields.filter((f) => (typeof (f as any).showIf === 'function' ? (f as any).showIf!(values) : true));
        if (visibleFields.length === 0) return null;
        return (
          <section key={sec.id} className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-1">{sec.title}</h2>
            {sec.description && <p className="text-sm text-gray-600 mb-2">{sec.description}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleFields.map((f) => {
                const min = (f as any).min ?? (f.type==='scale' ? 0 : undefined)
                const max = (f as any).max ?? (f.type==='scale' ? 10 : undefined)
                const step = (f as any).step ?? (f.type==='scale' ? 1 : undefined)

                return (
                  <label key={f.id} className="flex flex-col gap-2">
                    <span className="text-sm font-medium">{f.label}{(f as any).required ? ' *' : ''}</span>

                    {/* Texto / numéricos */}
                    {f.type === 'text' && <input className="input" placeholder={(f as any).placeholder} required={(f as any).required} value={values[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} />}
                    {f.type === 'textarea' && <textarea className="input" rows={4} placeholder={(f as any).placeholder} required={(f as any).required} value={values[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} />}
                    {f.type === 'number' && <input className="input" type="number" min={min} max={max} step={step ?? 1} placeholder={(f as any).placeholder} required={(f as any).required} value={values[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value === '' ? '' : Number(e.target.value))} />}
                    {f.type === 'date' && <input className="input" type="date" required={(f as any).required} value={values[f.id] || ''} onChange={(e) => set(f.id, e.target.value)} />}

                    {/* Slider 0–10 táctil para 'scale' */}
                    {f.type === 'scale' && (
                      <div className="slider-wrap">
                        <input
                          type="range"
                          min={min as number}
                          max={max as number}
                          step={step as number}
                          value={typeof values[f.id] === 'number' ? values[f.id] : (min as number)}
                          onChange={(e)=> set(f.id, Number(e.target.value))}
                          list={`${f.id}-ticks`}
                          className="slider"
                        />
                        <datalist id={`${f.id}-ticks`}>
                          {Array.from({length: (max as number - (min as number)) + 1}).map((_,i)=>{
                            const v = (min as number) + i
                            return <option key={v} value={v} />
                          })}
                        </datalist>
                        <div className="slider-scale">
                          <span>{min}</span>
                          <span className="bubble" style={{ left: `calc(${(( (Number(values[f.id] ?? min) - (min as number)) / ((max as number)-(min as number)) ) * 100)}% - 14px)` }}>
                            {typeof values[f.id] === 'number' ? values[f.id] : (min as number)}
                          </span>
                          <span>{max}</span>
                        </div>
                      </div>
                    )}

                    {/* Sí/No como botones grandes */}
                    {f.type === 'yesno' && (
                      <div className="btn-group">
                        {['Sí','No'].map(opt=>{
                          const active = values[f.id] === opt
                          return (
                            <button type="button" key={opt} onClick={()=>setSingle(f.id,opt)} className={`btn ${active?'btn-active':''}`}>
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Select como grupo de botones */}
                    {(f as any).type === 'select' && (
                      <div className="btn-wrap">
                        {(f as any).options.map((opt: string) => {
                          const active = values[f.id] === opt
                          return (
                            <button type="button" key={opt} onClick={()=>setSingle(f.id,opt)} className={`btn ${active?'btn-active':''}`}>
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Multiple (checks) */}
                    {(f as any).type === 'multi' && (
                      <div className="btn-wrap">
                        {(f as any).options.map((opt: string) => {
                          const active = Array.isArray(values[f.id]) && values[f.id].includes(opt);
                          return (
                            <button type="button" key={opt} onClick={() => toggleMulti(f.id, opt)} className={`btn ${active?'btn-active':''}`}>
                              <span className="mr-2">{active ? '✔︎' : '○'}</span>{opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}

      <style jsx global>{`
        .input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.9rem; background: white; font-size: 16px; }

        .btn-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
        .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 0.9rem 1rem; background: #f9fafb; font-size: 16px; }
        .btn-active { background: black; color: white; border-color: black; }
        @media (hover:hover){ .btn:hover { background: #f3f4f6; } }

        /* Slider styles (iOS-friendly) */
        .slider-wrap { position: relative; padding: 4px 2px 0; }
        .slider { -webkit-appearance: none; appearance: none; width: 100%; height: 14px; background: transparent; }
        .slider::-webkit-slider-runnable-track { height: 6px; background: #e5e7eb; border-radius: 999px; }
        .slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 28px; height: 28px; border-radius: 50%; background: #111827; margin-top: -11px; }
        .slider::-moz-range-track { height: 6px; background: #e5e7eb; border-radius: 999px; }
        .slider::-moz-range-thumb { width: 28px; height: 28px; border-radius: 50%; background: #111827; border: none; }
        .slider-scale { display:flex; justify-content:space-between; align-items:center; margin-top: 6px; position: relative; }
        .slider-scale > span { font-size: 12px; color: #6b7280; }
        .bubble { position: absolute; top: -28px; transform: translateX(-50%); background: #111827; color: white; font-size: 12px; padding: 2px 6px; border-radius: 999px; }
      `}</style>
    </div>
  );
}
