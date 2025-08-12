
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit, getStore } from '../../lib/store'

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    const { id, region } = req.query
    if(!id) return res.status(400).json({ ok:false, error:'Falta id' })
    const v = getOrCreateVisit(String(id))
    if(region && !v.bodyRegion) v.bodyRegion = String(region)
    // si no hay DDx aún, devolvemos uno dummy para ver la UI
    if(!v.ddxJSON){
      v.ddxJSON = { ddx: [
        { label:'Tendinopatía del supraespinoso', prob:55 },
        { label:'Impingement subacromial', prob:30 },
        { label:'Disfunción cervical referida', prob:15 },
      ]}
      if(!v.bodyRegion) v.bodyRegion = 'Hombro derecho'
    }
    return res.status(200).json({ ok:true, visit: v })
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message })
  }
}
