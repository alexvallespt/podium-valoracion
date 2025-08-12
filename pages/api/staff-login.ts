
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=='POST') return res.status(405).end()
    const { pin } = req.body || {}
    const ok = String(pin||'') === String(process.env.CLINIC_PIN || '2468')
    if(!ok) return res.status(401).json({ ok:false, error:'PIN incorrecto' })
    res.setHeader('Set-Cookie', `staff=1; HttpOnly; Path=/; SameSite=Lax; Max-Age=3600`)
    return res.status(200).json({ ok:true })
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message })
  }
}
