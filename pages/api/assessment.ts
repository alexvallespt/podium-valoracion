// pages/api/assessment.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

type AssessmentPayload = Record<string, unknown>

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }
  try {
    const { visitId, assessment } = (req.body || {}) as {
      visitId?: string
      assessment?: AssessmentPayload
    }

    if (!visitId || !assessment) {
      return res
        .status(400)
        .json({ ok: false, error: 'visitId y assessment son requeridos' })
    }

    const v = getOrCreateVisit(String(visitId))
    v.assessment = assessment

    return res.status(200).json({ ok: true, assessment })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return res.status(500).json({ ok: false, error: msg })
  }
}
