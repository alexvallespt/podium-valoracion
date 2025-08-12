
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=='POST') return res.status(405).end()
    const { visitId, assessment } = req.body || {}
    if(!visitId || !assessment) return res.status(400).json({ ok:false, error:'visitId y assessment son requeridos' })
    const v = getOrCreateVisit(String(visitId))
    v.assessment = assessment
    return res.status(200).json({ ok:true, assessment })
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message })
  }
}
