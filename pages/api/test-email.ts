import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const toEmail = (req.query.to as string) || 'alexvallespt@gmail.com';

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev', // remitente temporal permitido
      to: [toEmail],
      subject: 'Prueba de envío desde la app de Podium',
      html: `<h1>¡Funciona!</h1><p>Este es un correo de prueba enviado desde tu aplicación de valoración de pacientes.</p>`,
    });

    res.status(200).json({ ok: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error });
  }
}

