
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=='POST') return res.status(405).end()
    const { visitId, email, signaturePng, privacyText } = req.body || {}
    if(!visitId || !email || !signaturePng) return res.status(400).json({ ok:false, error:'visitId, email y firma son obligatorios' })
    const v = getOrCreateVisit(String(visitId))
    v.consent = { email, signaturePng, text: privacyText || '', timestamp: new Date().toISOString() }
    if(!v.patient) v.patient = { firstName:'', lastName:'', email }
    else v.patient.email = email
    return res.status(200).json({ ok:true, consent: v.consent })
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message })
  }
}
