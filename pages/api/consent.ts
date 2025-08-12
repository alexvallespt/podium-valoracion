// pages/api/consent.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOrCreateVisit } from '../../lib/store'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ ok: false, error: 'Método no permitido' })
    }

    const { visitId, email, signaturePng, privacyText } = req.body as {
      visitId?: string
      email?: string
      signaturePng?: string
      privacyText?: string
    }

    if (!visitId || !email || !signaturePng || !privacyText) {
      return res.status(400).json({ ok: false, error: 'Faltan campos' })
    }

    const v = getOrCreateVisit(String(visitId))
    v.consent = {
      email,
      text: privacyText,
      signaturePng,
      at: new Date().toISOString(),
    }

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}
