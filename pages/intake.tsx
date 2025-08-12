import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import FormRenderer, { Section } from '../components/FormRenderer'

function SignaturePad({onChange}:{onChange:(dataUrl:string)=>void}){
  const canvasRef = useRef<HTMLCanvasElement|null>(null)
  const drawing = useRef(false as boolean)
  function start(e:any){ drawing.current=true; draw(e) }
  function end(){ drawing.current=false; const c=canvasRef.current!; c.getContext('2d')!.beginPath() }
  function draw(e:any){
    if(!drawing.current) return
    const c = canvasRef.current!; const ctx = c.getContext('2d')!
    const r = c.getBoundingClientRect()
    const src = e.touches? e.touches[0]: e
    const x = src.clientX - r.left
    const y = src.clientY - r.top
    ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y)
    onChange(c.toDataURL('image/png'))
  }
  function clear(){
    const c=canvasRef.current!; const ctx=c.getContext('2d')!
    ctx.clearRect(0,0,c.width,c.height); ctx.beginPath(); onChange('')
  }
  return (
    <div>
      <canvas ref={canvasRef} width={600} height={200}
        onMouseDown={start} onMouseUp={end} onMouseMove={draw}
        onTouchStart={start} onTouchEnd={end} onTouchMove={draw}
        className="w-full border rounded-xl bg-white"/>
      <button type="button" onClick={clear} className="mt-2 underline text-sm">Borrar firma</button>
    </div>
  )
}

export default function Intake(){
  const router = useRouter(); const { visitId } = router.query
  const [values, setValues] = useState<Record<string,any>>({})
  const [accepted, setAccepted] = useState(false)
  const [signature, setSignature] = useState('')
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0) // 0..sections.length (el último es consentimiento)
  const [stage, setStage] = useState<'form'|'thinking'>('form')

  const pepTalks = [
    '¡Genial! Con esto ya podemos conocerte mejor.',
    'Perfecto, estamos entendiendo cómo empezó todo.',
    'Muy bien, esto nos ayuda a ver el historial del problema.',
    'Gracias. Estas preguntas son importantes para tu seguridad.',
    'Listo, vemos cómo impacta en tu día a día.',
    'Anotado. Así cuidamos tu salud general.',
    'Ya casi está. Nos ayuda a adaptar el plan a ti.',
    'Último paso: consentimiento y firma. ¡Lo tienes! 💪'
  ]

  // Bloques de anamnesis
  const sections: Section[] = useMemo(()=>[
    {
      id:'b1', title:'Datos personales y contacto',
      fields:[
        { id:'q1_nombre', label:'Nombre y apellidos', type:'text', required:true },
        { id:'q2_nacimiento', label:'Fecha de nacimiento', type:'date' },
        { id:'q3_sexo', label:'Sexo', type:'select', options:['Hombre','Mujer','Otro','Prefiero no decirlo'] },
        { id:'q4_altura', label:'Altura (cm)', type:'number', min:80, max:250 },
        { id:'q5_peso', label:'Peso (kg)', type:'number', min:20, max:300 },
        { id:'q6_dominancia', label:'Mano o pie dominante', type:'select', options:['Diestro','Zurdo','Ambidiestro'] },
        { id:'q7_ocupacion', label:'Ocupación actual', type:'textarea' },
        { id:'q8_trabajo', label:'Tu trabajo implica…', type:'multi', options:['Levantar o mover peso habitualmente','Mantenerte de pie muchas horas','Pasar sentado frente a un ordenador','Movimientos repetitivos','Conducción prolongada','Esfuerzo físico intenso','Ninguna de las anteriores'] },
        { id:'q8a_peso_frecuencia', label:'¿Cuánto peso aproximado sueles levantar y cuántas veces al día?', type:'text', showIf:(v)=>Array.isArray(v.q8_trabajo) && v.q8_trabajo.includes('Levantar o mover peso habitualmente') },
        { id:'q8b_ergonomia', label:'¿Usas ajustes ergonómicos (silla, reposapiés, pantalla ajustada)?', type:'yesno', showIf:(v)=>Array.isArray(v.q8_trabajo) && v.q8_trabajo.includes('Pasar sentado frente a un ordenador') },
        { id:'q9_deporte', label:'¿Practicas actividad física o deporte?', type:'yesno' },
        { id:'q9a_cuales', label:'¿Cuál/es?', type:'textarea', showIf:(v)=>v.q9_deporte==='Sí' },
        { id:'q9b_frecuencia', label:'¿Con qué frecuencia semanal?', type:'select', options:['1-2 días','3-4 días','5 o más'], showIf:(v)=>v.q9_deporte==='Sí' },
        { id:'q9c_nivel', label:'¿Nivel?', type:'select', options:['Recreativo','Competitivo'], showIf:(v)=>v.q9_deporte==='Sí' },
        { id:'q10_hobbies', label:'Hobbies o actividades de ocio', type:'textarea' },
        { id:'q11_fumas', label:'¿Fumas?', type:'yesno' },
        { id:'q11a_cigs', label:'¿Cuántos cigarrillos/día?', type:'number', min:0, max:100, showIf:(v)=>v.q11_fumas==='Sí' },
        { id:'q12_alcohol', label:'¿Consumes alcohol habitualmente?', type:'yesno' },
        { id:'q13_sueno', label:'Calidad de tu sueño (0-10)', type:'scale', min:0, max:10 },
        { id:'q14_cambio_peso', label:'¿Has notado cambios de peso en los últimos 6 meses?', type:'select', options:['Sí, he aumentado','Sí, he bajado','No'] },
        { id:'q14a_cuantos', label:'¿Cuántos kg y en cuánto tiempo?', type:'text', showIf:(v)=>v.q14_cambio_peso==='Sí, he bajado' },
        { id:'email', label:'Email para envío del acuse', type:'text', required:true, placeholder:'tucorreo@dominio.com' }
      ]
    },
    {
      id:'b2', title:'Motivo de consulta',
      fields:[
        { id:'q15_motivo', label:'¿Qué te trae hoy a consulta? Describe el problema principal.', type:'textarea', required:true },
        { id:'q16_desde_cuando_num', label:'¿Desde cuándo? (número)', type:'number', min:0 },
        { id:'q16_desde_cuando_ud', label:'Unidad de tiempo', type:'select', options:['días','semanas','meses','años'] },
        { id:'q17_como_empezo', label:'¿Cómo empezó?', type:'select', options:['De forma repentina con un golpe o accidente','Poco a poco sin causa clara','Después de un esfuerzo','Otro'] },
        { id:'q17a_golpe', label:'Describe qué ocurrió y los síntomas inmediatos', type:'textarea', showIf:(v)=>v.q17_como_empezo==='De forma repentina con un golpe o accidente' },
        { id:'q18_donde', label:'¿Dónde notas el síntoma principal?', type:'text' },
        { id:'q19_irradia', label:'¿El dolor se queda o se extiende?', type:'select', options:['Se queda','Se extiende'] },
        { id:'q19a_a_donde', label:'¿Hacia dónde se extiende?', type:'textarea', showIf:(v)=>v.q19_irradia==='Se extiende' },
        { id:'q20_tipo', label:'Describe el tipo de dolor o molestia', type:'multi', options:['Punzante','Quemante','Eléctrico','Opresivo','Sordo','Pulsátil','Otro'] },
        { id:'q21_intensidad', label:'Intensidad de dolor actual (0-10)', type:'scale', min:0, max:10 },
        { id:'q22_constante', label:'¿Es constante o intermitente?', type:'select', options:['Constante','Intermitente'] },
        { id:'q22a_frec', label:'¿Con qué frecuencia y duración aproximada?', type:'text', showIf:(v)=>v.q22_constante==='Intermitente' },
        { id:'q23_empeora', label:'¿En qué momentos empeora?', type:'textarea' },
        { id:'q24_mejora', label:'¿En qué momentos mejora?', type:'textarea' },
        { id:'q25_rigidez', label:'¿Notas rigidez al despertar?', type:'yesno' },
        { id:'q25a_rigidez_min', label:'¿Cuánto dura hasta que mejora? (minutos)', type:'number', min:0, showIf:(v)=>v.q25_rigidez==='Sí' },
        { id:'q26_dolor_noche', label:'¿El dolor te despierta por la noche?', type:'yesno' },
        { id:'q26a_mejora_postura', label:'¿Mejora al cambiar de postura?', type:'yesno', showIf:(v)=>v.q26_dolor_noche==='Sí' },
      ]
    },
    {
      id:'b3', title:'Antecedentes del problema',
      fields:[
        { id:'q27_recurrencia', label:'¿Has tenido este mismo problema antes?', type:'yesno' },
        { id:'q27a_cuantas', label:'¿Cuántas veces y en qué periodo?', type:'text', showIf:(v)=>v.q27_recurrencia==='Sí' },
        { id:'q28_que_hiciste', label:'¿Qué has hecho hasta ahora para tratarlo?', type:'textarea' },
        { id:'q29_pruebas', label:'¿Te han hecho pruebas médicas?', type:'yesno' },
        { id:'q29a_cuales', label:'¿Cuáles y resultados?', type:'textarea', showIf:(v)=>v.q29_pruebas==='Sí' },
        { id:'q30_meds', label:'¿Tomas medicación para este problema?', type:'yesno' },
        { id:'q30a_cuales', label:'¿Cuál/es y con qué frecuencia?', type:'textarea', showIf:(v)=>v.q30_meds==='Sí' },
      ]
    },
    {
      id:'b4', title:'Síntomas asociados (seguridad)',
      fields:[
        { id:'q31_fiebre', label:'¿Has tenido fiebre, escalofríos o sudores nocturnos recientes?', type:'yesno' },
        { id:'q32_peso', label:'¿Has perdido peso sin causa aparente en los últimos meses?', type:'yesno' },
        { id:'q33_cancer', label:'¿Antecedentes de cáncer?', type:'yesno' },
        { id:'q34_debilidad', label:'¿Debilidad en brazos o piernas?', type:'yesno' },
        { id:'q35_hormigueo', label:'¿Hormigueos o pérdida de sensibilidad?', type:'yesno' },
        { id:'q35a_donde', label:'¿Dónde?', type:'text', showIf:(v)=>v.q35_hormigueo==='Sí' },
        { id:'q36_esfinteres', label:'¿Dificultad para controlar orina o heces?', type:'yesno' },
        { id:'q37_silla', label:'¿Adormecimiento en zona genital o entre las piernas?', type:'yesno' },
        { id:'q38_invariante', label:'¿Dolor que no cambia con postura o actividad?', type:'yesno' },
        { id:'q39_pecho', label:'¿Dolor en el pecho, falta de aire o palpitaciones recientes?', type:'yesno' },
      ]
    },
    {
      id:'b5', title:'Limitaciones y vida diaria',
      fields:[
        { id:'q40_limitaciones', label:'¿Qué actividades te cuesta o has dejado de hacer?', type:'textarea' },
        { id:'q41_trabajo_afecta', label:'¿Te afecta para trabajar?', type:'yesno' },
        { id:'q41a_como', label:'Describe de qué forma', type:'textarea', showIf:(v)=>v.q41_trabajo_afecta==='Sí' },
        { id:'q42_deporte_dejado', label:'¿Has dejado algún deporte/hobby por este problema?', type:'yesno' },
        { id:'q42a_cuales', label:'¿Cuál/es?', type:'textarea', showIf:(v)=>v.q42_deporte_dejado==='Sí' },
        { id:'q43_ayudas', label:'¿Usas alguna ayuda (bastón, muletas, faja, rodillera)?', type:'yesno' },
      ]
    },
    {
      id:'b6', title:'Antecedentes médicos',
      fields:[
        { id:'q44_enfermedades', label:'¿Tienes alguna enfermedad diagnosticada?', type:'textarea' },
        { id:'q45_cirugias', label:'¿Has tenido cirugías o lesiones importantes?', type:'textarea' },
        { id:'q46_familia', label:'¿Antecedentes familiares relevantes?', type:'textarea' },
        { id:'q47_med_habitual', label:'¿Tomas medicación habitual?', type:'yesno' },
        { id:'q47a_cuales', label:'¿Cuál/es?', type:'textarea', showIf:(v)=>v.q47_med_habitual==='Sí' },
        { id:'q48_alergias', label:'Alergias conocidas', type:'textarea' },
      ]
    },
    {
      id:'b7', title:'Motivación y expectativas',
      fields:[
        { id:'q49_emocion', label:'¿Cómo te sientes por este problema?', type:'select', options:['tranquilo/a','algo preocupado/a','muy preocupado/a','desesperado/a'] },
        { id:'q50_kinesiophobia', label:'¿Temes moverte por miedo a empeorar?', type:'yesno' },
        { id:'q51_creencia', label:'En tu opinión, ¿qué está causando tu problema?', type:'textarea' },
        { id:'q52_esperas', label:'¿Qué esperas conseguir con la fisioterapia?', type:'textarea' },
        { id:'q53_compromiso', label:'Compromiso con recomendaciones y ejercicios (0-10)', type:'scale', min:0, max:10 },
        { id:'q54_objetivo', label:'Si te recuperas, ¿qué te gustaría volver a hacer primero?', type:'textarea' },
        { id:'q55_por_que_ahora', label:'¿Por qué has decidido tratar este problema justo ahora?', type:'textarea' },
        { id:'q56_cambio_vida', label:'Si desapareciera por completo, ¿cómo cambiaría tu vida?', type:'textarea' },
        { id:'q57_urgencia', label:'¿Cuánta urgencia (0-10)?', type:'scale', min:0, max:10 },
        { id:'q58_afectacion', label:'¿Cuánto afecta a tu calidad de vida (0-10)?', type:'scale', min:0, max:10 },
        { id:'q59_si_no_haces', label:'¿Qué crees que pasaría si no hicieras nada?', type:'textarea' },
        { id:'q60_otras_sol', label:'¿Has intentado otras soluciones antes?', type:'yesno' },
        { id:'q60a_cuales', label:'¿Cuáles y resultado?', type:'textarea', showIf:(v)=>v.q60_otras_sol==='Sí' },
        { id:'q61_dispuesto', label:'¿Qué tan dispuesto/a estás a invertir?', type:'select', options:['Haría lo que sea necesario','Estoy dispuesto/a a hacer cambios importantes','Solo si es algo rápido y sin mucho esfuerzo','No lo tengo claro'] },
        { id:'q62_barreras', label:'¿Qué podría impedir seguir el programa?', type:'multi', options:['Falta de tiempo','Falta de dinero','Falta de constancia','Miedo a no mejorar','No me gusta hacer ejercicio','Otra'] },
        { id:'q63_depende', label:'Si encuentras un tratamiento que te da confianza, ¿lo empezarías de inmediato?', type:'select', options:['Sí','No','Depende'] },
        { id:'q63a_de_que', label:'¿De qué dependería?', type:'textarea', showIf:(v)=>v.q63_depende==='Depende' },
      ]
    },
  ], [])

  // Mantén step dentro de 0..sections.length si cambia el nº de bloques
  useEffect(()=>{
    setStep(s => Math.max(0, Math.min(Number(s) || 0, sections.length)))
  }, [sections.length])

  // Autosave por visita
  const storageKey = typeof window !== 'undefined' && visitId ? `intake:${visitId}` : null
  useEffect(()=>{
    if(!storageKey) return
    const raw = localStorage.getItem(storageKey)
    if(raw){
      try{
        const parsed = JSON.parse(raw)
        setValues(parsed.values || {})
        setAccepted(!!parsed.accepted)
        setSignature(parsed.signature || '')
        setStep(Math.max(0, Math.min(Number(parsed.step) || 0, sections.length)))
      }catch{}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(()=>{
    if(!storageKey) return
    const t = setTimeout(()=>{
      localStorage.setItem(storageKey, JSON.stringify({ values, accepted, signature, step }))
    }, 300)
    return ()=>clearTimeout(t)
  }, [values, accepted, signature, step, storageKey])

  const privacyText = `Autorizo a Clínica Podium al tratamiento de mis datos de salud con fines asistenciales y envío del acuse por email. He leído y acepto la Política de Privacidad (RGPD/LOPDGDD).`

  // Navegación entre pasos (forma funcional para evitar cierres obsoletos)
  function goNext(){
    setStep(prev => (prev < sections.length ? prev + 1 : sections.length))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function goPrev(){
    setStep(prev => (prev > 0 ? prev - 1 : 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function onSubmit(e:any){
    e.preventDefault(); if(!visitId){ alert('Falta visitId en la URL'); return }
    if(!values.email){ alert('El email es obligatorio'); setStep(0); return }
    if(!accepted || !signature){ alert('Debes aceptar y firmar el consentimiento'); setStep(sections.length); return }
    setSaving(true); setStage('thinking')

    const flags:string[] = []
    if(['q31_fiebre','q32_peso','q33_cancer','q36_esfinteres','q37_silla','q39_pecho'].some(k=>values[k]==='Sí')) flags.push('RED_FLAG')
    if(values.q19_irradia==='Se extiende') flags.push('RADIATING_PAIN')
    if(values.q25_rigidez==='Sí' && Number(values.q25a_rigidez_min||0) > 30) flags.push('STIFFNESS_>30MIN')
    if(Number(values.q53_compromiso||0) < 5) flags.push('LOW_ADHERENCE')
    if(Number(values.q57_urgencia||0) >=8 && Number(values.q58_afectacion||0) >=8) flags.push('HIGH_URGENCY_IMPACT')
    const intake = { ...values, _flags: flags }

    await fetch('/api/patient',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ visitId, intake }) })
    await fetch('/api/dx',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ visitId }) })
    await fetch('/api/consent',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
      visitId, email: values.email, signaturePng: signature, privacyText
    }) })
    await fetch('/api/report', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ visitId }) })

    if(storageKey) localStorage.removeItem(storageKey)
    router.push(`/handoff?visitId=${visitId}`)
  }

  // Cálculo directo del progreso (sin estados derivados)
  const clampedStep = Math.max(0, Math.min(Number(step) || 0, sections.length))
  const percent = Math.round((clampedStep / Math.max(1, sections.length)) * 100)

  if(stage === 'thinking'){
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Gracias. Guardando tu cuestionario…</h1>
        <p className="text-gray-600">En un momento, tu fisioterapeuta continuará contigo.</p>
        <div className="animate-pulse h-3 bg-gray-200 rounded-full" />
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-3xl mx-auto p-4">
      {/* Header con barra inline; key fuerza re-mount al cambiar de paso */}
      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur py-3" key={clampedStep}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Anamnesis – Clínica Podium</h1>
          <div className="w-48">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-black rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Progreso: {percent}% · Paso {clampedStep}/{sections.length}
        </p>
      </div>

      {clampedStep < sections.length ? (
        <>
          <p className="text-sm text-gray-600">
            {pepTalks[Math.min(pepTalks.length-1, clampedStep)]}
          </p>
          <FormRenderer sections={[sections[clampedStep]]} values={values} onChange={setValues} />
        </>
      ) : (
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="text-lg font-semibold">Consentimiento RGPD/LOPDGDD</h2>
          <p className="text-sm text-gray-700">
            {pepTalks[pepTalks.length-1]}<br/>
            Autorizo a Clínica Podium al tratamiento de mis datos de salud con fines asistenciales y envío del acuse por email.
            He leído y acepto la Política de Privacidad (RGPD/LOPDGDD).
          </p>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} /> <span>Acepto el tratamiento y el envío por email</span>
          </label>
          <SignaturePad onChange={setSignature}/>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={goPrev} disabled={clampedStep===0} className={`px-4 py-3 rounded-xl border ${clampedStep===0? 'opacity-40 cursor-not-allowed':'bg-white'}`}>
          ← Atrás
        </button>
        {clampedStep < sections.length ? (
          <button type="button" onClick={goNext} className="px-4 py-3 rounded-xl bg-black text-white font-semibold">
            Seguimos →
          </button>
        ) : (
          <button type="submit" disabled={saving} className="px-4 py-3 rounded-xl bg-black text-white font-semibold w-40">
            {saving?'Enviando…':'Enviar'}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Guardado automático activado · Si cierras la página, podrás continuar después.
      </p>
    </form>
  )
}
