// pages/api/visit.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

type DdxItem = { label: string; prob: number }
type Visit = {
  bodyRegion?: string
  ddxJSON?: { ddx: DdxItem[] }
  // otros campos que no necesitamos tipar aquí
}

type ApiData =
  | { ok: true; visit: Visit }
  | { ok: false; error: string }

export default function handler(req: NextApiRequest, res: NextApiResponse<ApiData>) {
  try {
    const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
    const regionParam = Array.isArray(req.query.region) ? req.query.region[0] : req.query.region

    if (!idParam) {
      return res.status(400).json({ ok: false, error: 'Falta id' })
    }

    const v = getOrCreateVisit(String(idParam)) as Visit

    if (regionParam && !v.bodyRegion) {
      v.bodyRegion = String(regionParam)
    }

    // si no hay DDx aún, devolvemos uno dummy para ver la UI
    if (!v.ddxJSON) {
      v.ddxJSON = {
        ddx: [
          { label: 'Tendinopatía del supraespinoso', prob: 55 },
          { label: 'Impingement subacromial', prob: 30 },
          { label: 'Disfunción cervical referida', prob: 15 },
        ],
      }
      if (!v.bodyRegion) v.bodyRegion = 'Hombro derecho'
    }

    return res.status(200).json({ ok: true, visit: v })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error inesperado'
    return res.status(500).json({ ok: false, error: message })
  }
}
