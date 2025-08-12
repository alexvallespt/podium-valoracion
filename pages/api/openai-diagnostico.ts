import type { NextApiRequest, NextApiResponse } from 'next'

type DDX = { label: string; prob: number; why: string; segment_focus?: string }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Method not allowed' })
    const { anamnesis } = req.body || {}
    if (!anamnesis) return res.status(400).json({ ok:false, error:'Falta anamnesis' })

    const key = process.env.OPENAI_API_KEY
    if (!key) {
      // Fallback sin clave: datos ficticios
      const ddx: DDX[] = [
        { label:'Tendinopatía del supraespinoso', prob: 55, why:'Dolor con elevación y patrón subacromial.' },
        { label:'Impingement subacromial', prob: 30, why:'Dolor mecánico en rango medio, nocturno ocasional.' },
        { label:'Disfunción cervical referida', prob: 15, why:'Posible contribución cervicogénica por historia.' },
      ]
      return res.status(200).json({ ok:true, ddx })
    }

    // Llamada directa a OpenAI REST (sin SDK para simplicidad)
    const r = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role:'system', content:
            'Eres un fisio experto. Responde SOLO JSON válido como {"ddx":[{"label":"","prob":0,"why":"","segment_focus":""},...]} con 3 items. "prob" en 0-100 (entero). Lenguaje claro y prudente.'
          },
          { role:'user', content: `ANAMNESIS:\n${anamnesis}\nGenera 3 diagnósticos diferenciales.` }
        ]
      })
    })
    const data = await r.json()
    let parsed:any = {}
    try { parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}') } catch {}
    const ddx: DDX[] = Array.isArray(parsed.ddx) ? parsed.ddx : []
    if (!ddx.length) return res.status(200).json({ ok:true, ddx:[
      { label:'Dolor mecánico inespecífico', prob: 50, why:'Contenido no estructurado; respuesta por defecto.' },
      { label:'Patología tendinosa probable', prob: 30, why:'Síntomas de carga repetida o sobreuso.' },
      { label:'Componente referido/vecino', prob: 20, why:'Posible influencia de segmento adyacente.' },
    ]})
    return res.status(200).json({ ok:true, ddx })
  } catch (e:any) {
    return res.status(500).json({ ok:false, error:e.message })
  }
}
