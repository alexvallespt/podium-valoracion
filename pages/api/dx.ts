
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=='POST') return res.status(405).end()
    const { visitId } = req.body || {}
    if(!visitId) return res.status(400).json({ ok:false, error:'visitId requerido' })
    const v = getOrCreateVisit(String(visitId))
    const intake = v.intake || {}

    const key = process.env.OPENAI_API_KEY
    if(!key){
      // Fallback sin API: heurísticos simples basados en el texto/zona
      const br = (v.bodyRegion||'').toLowerCase()
      let ddx = [{label:'Dolor mecánico inespecífico', prob:50},{label:'Patología tendinosa', prob:30},{label:'Dolor referido/vecino', prob:20}]
      if(/hombro/.test(br)) ddx = [{label:'Tendinopatía del supraespinoso', prob:55},{label:'Impingement subacromial', prob:30},{label:'Disfunción cervical referida', prob:15}]
      if(/rodilla/.test(br)) ddx = [{label:'Tendinopatía rotuliana', prob:50},{label:'Dolor patelofemoral', prob:30},{label:'Meniscopatía', prob:20}]
      if(/tobillo|aquiles|pie/.test(br)) ddx = [{label:'Tendinopatía aquílea', prob:55},{label:'Esguince lateral', prob:25},{label:'Síndrome canal tarsal', prob:20}]
      v.ddxJSON = { ddx }
      return res.status(200).json({ ok:true, ddx })
    }

    const prompt = `Eres fisioterapeuta experto en diagnóstico diferencial.
Responde SOLO JSON como {"ddx":[{"label":"","prob":0,"why":""},...]}
3 diagnósticos diferenciales, "prob" 0-100, "why" breve.
ANAMNESIS JSON:\n${JSON.stringify(intake)}`

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages:[
          { role:'system', content:'Responde solo JSON válido.' },
          { role:'user', content: prompt }
        ]
      })
    })
    const data = await r.json()
    let parsed:any = {}
    try{ parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}') }catch{}
    const ddx = Array.isArray(parsed.ddx) && parsed.ddx.length ? parsed.ddx : [{label:'Dolor mecánico inespecífico', prob:50, why:'Respuesta por defecto'}]
    v.ddxJSON = { ddx }
    return res.status(200).json({ ok:true, ddx })
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message })
  }
}
