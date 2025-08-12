import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateVisit } from "../../lib/store";
import { Resend } from "resend";

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { visitId } = req.body || {};
    if(!visitId) return res.status(400).json({ ok:false, error:"visitId requerido" });
    const v = getOrCreateVisit(String(visitId));

    const brief = `Hola ${v.patient?.firstName||""},
Hemos recibido tu formulario y tu fisioterapeuta ya está revisándolo.
En tu cita, continuaréis con la valoración en camilla y te explicaremos el plan.
Un saludo, equipo Podium.`;

    v.report = {
      summaryMD: `# Anamnesis recibida
- Zona: ${v.bodyRegion||"-"}
- Flags: ${(v.intake?._flags||[]).join(", ") || "—"}
- DDx (solo personal): ${(v.ddxJSON?.ddx||[]).map((d:any)=>d.label+" "+d.prob+"%").join(", ")}`,
      patientBrief: brief,
      planPhases: { phases: [1,2,3,4,5] },
      createdAt: new Date().toISOString()
    };

    const email = v.patient?.email;
    if(email && process.env.RESEND_API_KEY){
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Hemos recibido tu anamnesis – Podium",
        text: brief
      });
    }

    return res.status(200).json({ ok:true, report: v.report });
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message });
  }
}
