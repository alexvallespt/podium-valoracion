import { upsertPatientFromIntake } from '../../lib/store';
// ...
upsertPatientFromIntake(String(visitId), intake);

import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=='POST') return res.status(405).end()
    const { visitId, intake } = req.body || {}
    if(!visitId || !intake) return res.status(400).json({ ok:false, error:'visitId e intake son requeridos' })
    const v = getOrCreateVisit(String(visitId))
    v.intake = intake

    // Mapear algunos campos útiles
    const fullName = (intake.q1_nombre || '').trim()
    const [firstName, ...rest] = fullName.split(' ')
    v.patient = { firstName, lastName: rest.join(' ') || '', email: intake.email || v.patient?.email }
    // Intento de zona
    if(!v.bodyRegion && typeof intake.q18_donde === 'string'){ v.bodyRegion = intake.q18_donde }
    return res.status(200).json({ ok:true, visit: v })
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message })
  }
}
