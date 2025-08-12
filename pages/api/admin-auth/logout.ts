import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
  )
  return res.status(200).json({ ok: true })
}
