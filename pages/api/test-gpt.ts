import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ ok: false, error: 'Falta OPENAI_API_KEY en .env' })
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Eres un asistente que responde en una línea.' },
        { role: 'user', content: 'Di “OK GPT funcionando” y nada más.' }
      ]
    })
    const text = completion.choices?.[0]?.message?.content?.trim() || '(sin respuesta)'
    res.status(200).json({ ok: true, text })
  } catch (e:any) {
    res.status(500).json({ ok: false, error: e.message })
  }
}
