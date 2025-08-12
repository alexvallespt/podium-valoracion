#!/usr/bin/env bash
set -e
mkdir -p components pages/staff/visit pages/api/staff-auth pages/exam pages/api

# ========== components ==========
cat > components/AnamnesisView.tsx <<'TS'
import React from "react";

function Row({label, value}:{label:string; value:any}){
  if(value==null || value==="") return null;
  const txt = Array.isArray(value) ? value.join(", ") : String(value);
  return (
    <div className="grid grid-cols-3 gap-2 py-1 text-sm">
      <div className="text-gray-600">{label}</div>
      <div className="col-span-2">{txt}</div>
    </div>
  );
}

export default function AnamnesisView({data}:{data:Record<string,any>}){
  if(!data) return null;
  const f = data || {};
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-2">Anamnesis completa</h3>

      {(f._flags && f._flags.length>0) && (
        <div className="mb-3 flex flex-wrap gap-2">{f._flags.map((x:string)=>(
          <span key={x} className="px-2 py-1 rounded-full text-xs bg-black text-white">{x}</span>
        ))}</div>
      )}

      <details open className="mb-2">
        <summary className="font-medium cursor-pointer">Datos y contexto</summary>
        <div className="mt-2">
          <Row label="Nombre" value={f.q1_nombre} />
          <Row label="Nacimiento" value={f.q2_nacimiento} />
          <Row label="Sexo" value={f.q3_sexo} />
          <Row label="Dominancia" value={f.q6_dominancia} />
          <Row label="Ocupación" value={f.q7_ocupacion} />
          <Row label="Trabajo implica" value={f.q8_trabajo} />
          <Row label="Deporte" value={f.q9_deporte} />
          {f.q9_deporte==="Sí" && (<>
            <Row label="Deportes" value={f.q9a_cuales} />
            <Row label="Frecuencia" value={f.q9b_frecuencia} />
            <Row label="Nivel" value={f.q9c_nivel} />
          </>)}
        </div>
      </details>

      <details open className="mb-2">
        <summary className="font-medium cursor-pointer">Motivo de consulta</summary>
        <div className="mt-2">
          <Row label="Motivo" value={f.q15_motivo} />
          <Row label="Evolución" value={`${f.q16_desde_cuando_num||""} ${f.q16_desde_cuando_ud||""}`} />
          <Row label="Inicio" value={f.q17_como_empezo} />
          {f.q17_como_empezo==="De forma repentina con un golpe o accidente" && <Row label="Descripción del golpe" value={f.q17a_golpe} />}
          <Row label="Zona principal" value={f.q18_donde} />
          <Row label="Irradia" value={f.q19_irradia} />
          {f.q19_irradia==="Se extiende" && <Row label="¿Hacia dónde?" value={f.q19a_a_donde} />}
          <Row label="Tipo dolor" value={f.q20_tipo} />
          <Row label="Intensidad (0–10)" value={f.q21_intensidad} />
          <Row label="Constante/intermitente" value={f.q22_constante} />
          {f.q22_constante==="Intermitente" && <Row label="Frecuencia/duración" value={f.q22a_frec} />}
          <Row label="Empeora" value={f.q23_empeora} />
          <Row label="Mejora" value={f.q24_mejora} />
          <Row label="Rigidez matinal" value={f.q25_rigidez} />
          {f.q25_rigidez==="Sí" && <Row label="Minutos rigidez" value={f.q25a_rigidez_min} />}
          <Row label="Dolor nocturno" value={f.q26_dolor_noche} />
          {f.q26_dolor_noche==="Sí" && <Row label="Mejora al cambiar postura" value={f.q26a_mejora_postura} />}
        </div>
      </details>

      <details className="mb-2">
        <summary className="font-medium cursor-pointer">Síntomas asociados / seguridad</summary>
        <div className="mt-2">
          {["q31_fiebre","q32_peso","q33_cancer","q36_esfinteres","q37_silla","q39_pecho"].some((k:string)=>f[k]==="Sí") && (
            <p className="text-xs text-red-600 mb-1">⚠︎ Alguna bandera roja marcada</p>
          )}
          <Row label="Fiebre/sudores" value={f.q31_fiebre} />
          <Row label="Pérdida de peso" value={f.q32_peso} />
          <Row label="Antecedente de cáncer" value={f.q33_cancer} />
          <Row label="Debilidad" value={f.q34_debilidad} />
          <Row label="Hormigueo/sensibilidad" value={f.q35_hormigueo} />
          {f.q35_hormigueo==="Sí" && <Row label="¿Dónde?" value={f.q35a_donde} />}
          <Row label="Esfínteres" value={f.q36_esfinteres} />
          <Row label="Silla de montar" value={f.q37_silla} />
          <Row label="Dolor invariante" value={f.q38_invariante} />
          <Row label="Dolor torácico / palpitaciones" value={f.q39_pecho} />
        </div>
      </details>

      <details>
        <summary className="font-medium cursor-pointer">Motivación y expectativas</summary>
        <div className="mt-2">
          <Row label="Estado emocional" value={f.q49_emocion} />
          <Row label="Miedo a moverse" value={f.q50_kinesiophobia} />
          <Row label="Creencia causa" value={f.q51_creencia} />
          <Row label="Objetivos" value={f.q52_esperas} />
          <Row label="Compromiso (0–10)" value={f.q53_compromiso} />
          <Row label="Resultado soñado" value={f.q56_cambio_vida} />
          <Row label="Urgencia (0–10)" value={f.q57_urgencia} />
          <Row label="Afectación (0–10)" value={f.q58_afectacion} />
          <Row label="Barreras" value={f.q62_barreras} />
        </div>
      </details>
    </div>
  );
}
TS

# ========== staff portal ==========
cat > pages/staff/login.tsx <<'TS'
import { useRouter } from "next/router";
import { useState } from "react";

export default function StaffLogin(){
  const router = useRouter();
  const [email, setEmail] = useState("fisio@podium.local");
  const [password, setPassword] = useState("1234");
  const [err, setErr] = useState<string|undefined>();

  async function onSubmit(e:any){
    e.preventDefault();
    setErr(undefined);
    const r = await fetch("/api/staff-auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email, password }) });
    if(r.ok){ router.push("/staff"); } else { const j = await r.json(); setErr(j.error || "Error de acceso"); }
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Acceso personal</h1>
      <p className="text-sm text-gray-600 mb-4">Inicia sesión con tu cuenta corporativa.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Email</span>
          <input className="w-full border rounded-xl p-3" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm">Contraseña</span>
          <input type="password" className="w-full border rounded-xl p-3" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="w-full bg-black text-white rounded-xl p-3">Entrar</button>
      </form>
    </div>
  );
}
TS

cat > pages/staff/index.tsx <<'TS'
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StaffHome(){
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(()=>{
    async function load(){
      const r = await fetch("/api/visits");
      const j = await r.json();
      setVisits(j.visits || []);
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel del fisio</h1>
        <form action="/api/staff-auth/logout" method="post">
          <button className="text-sm underline">Cerrar sesión</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Visitas recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">ID</th>
                <th className="py-2">Paciente</th>
                <th className="py-2">Zona</th>
                <th className="py-2">Creada</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visits.map(v=>(
                <tr key={v.id} className="border-b last:border-0">
                  <td className="py-2">{v.id}</td>
                  <td className="py-2">{v.patient?.firstName} {v.patient?.lastName}</td>
                  <td className="py-2">{v.bodyRegion || "—"}</td>
                  <td className="py-2">{new Date(v.createdAt).toLocaleString()}</td>
                  <td className="py-2">
                    <Link className="underline mr-3" href={`/staff/visit/${v.id}`}>Ver anamnesis</Link>
                    <Link className="underline" href={`/exam/${v.id}`}>Iniciar evaluación</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
TS

cat > pages/staff/visit/[id].tsx <<'TS'
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AnamnesisView from "../../../components/AnamnesisView";

export default function StaffVisit(){
  const router = useRouter();
  const { id } = router.query;
  const [visit, setVisit] = useState<any>(null);
  useEffect(()=>{
    async function load(){
      if(!id) return;
      const r = await fetch(`/api/visit?id=${id}`);
      const j = await r.json();
      setVisit(j.visit);
    }
    load();
  }, [id]);
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-xl shadow p-4">
        <h1 className="text-2xl font-bold">Anamnesis – {visit?.patient?.firstName} {visit?.patient?.lastName}</h1>
        <p className="text-sm text-gray-600">Zona: {visit?.bodyRegion || "—"}</p>
        {visit?.ddxJSON?.ddx && (
          <div className="mt-2 text-sm">
            <p className="font-medium">Hipótesis IA (top-3):</p>
            <ul className="list-disc ml-5">
              {visit.ddxJSON.ddx.map((d:any,i:number)=>(<li key={i}>{d.label} — {d.prob}%</li>))}
            </ul>
          </div>
        )}
      </div>
      <AnamnesisView data={visit?.intake} />
      <div className="flex gap-3 justify-end">
        <button onClick={()=>router.push(`/exam/${id}`)} className="px-4 py-3 rounded-xl bg-black text-white">Iniciar evaluación</button>
      </div>
    </div>
  );
}
TS

# ========== APIs staff ==========
cat > pages/api/staff-auth/login.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

function parseUsers(env?: string){
  const map: Record<string,string> = {};
  const src = env || "fisio@podium.local:1234";
  src.split(",").map(s=>s.trim()).forEach(pair=>{
    const [email, pass] = pair.split(":");
    if(email && pass){ map[email.toLowerCase()] = pass; }
  });
  return map;
}

export default function handler(req:NextApiRequest, res:NextApiResponse){
  try{
    if(req.method!=="POST") return res.status(405).end();
    const { email, password } = req.body || {};
    const users = parseUsers(process.env.STAFF_USERS);
    const ok = users[String(email||"").toLowerCase()] === String(password||"");
    if(!ok) return res.status(401).json({ ok:false, error:"Credenciales incorrectas" });
    const name = String(email||"");
    res.setHeader("Set-Cookie", [
      `staff=1; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`,
      `staffName=${encodeURIComponent(name)}; Path=/; SameSite=Lax; Max-Age=86400`
    ]);
    return res.status(200).json({ ok:true, name });
  }catch(e:any){
    return res.status(500).json({ ok:false, error:e.message });
  }
}
TS

cat > pages/api/staff-auth/logout.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest,res:NextApiResponse){
  res.setHeader("Set-Cookie", [
    `staff=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    `staffName=; Path=/; SameSite=Lax; Max-Age=0`
  ]);
  res.status(200).json({ ok:true });
}
TS

cat > pages/api/visits.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";
import { getStore } from "../../lib/store";

export default function handler(req:NextApiRequest,res:NextApiResponse){
  try{
    const store = getStore();
    const list = Object.values(store.visits).sort((a,b)=> (a.createdAt<b.createdAt?1:-1));
    res.status(200).json({ ok:true, visits:list });
  }catch(e:any){
    res.status(500).json({ ok:false, error:e.message });
  }
}
TS

cat > pages/api/whoami.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest, res:NextApiResponse){
  const cookie = req.headers.cookie || "";
  const staff = /(^|; )staff=1(;|$)/.test(cookie);
  res.status(200).json({ ok:true, staff });
}
TS

# ========== Exam (solo personal) ==========
cat > pages/exam/[visitId].tsx <<'TS'
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import NumericTable from "../../components/NumericTable";
import ScalesPanel from "../../components/ScalesPanel";
import { TestChecklist } from "../../components/TestSets";
import { getExamBlueprint } from "../../lib/examBlueprint";
import AnamnesisView from "../../components/AnamnesisView";

export default function ExamSmart(){
  const router = useRouter();
  const { visitId } = router.query;
  const [visit, setVisit] = useState<any>(null);

  const [rom, setRom] = useState<Record<string,any>>({});
  const [strength, setStrength] = useState<Record<string,any>>({});
  const [ortho, setOrtho] = useState<Record<string,any>>({});
  const [neuro, setNeuro] = useState<Record<string,any>>({});
  const [functional, setFunctional] = useState<Record<string,any>>({});
  const [scores, setScores] = useState<Record<string,any>>({});
  const [notes, setNotes] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    async function check(){
      const r = await fetch("/api/whoami");
      const j = await r.json();
      if(!j.staff){ router.push("/staff/login"); }
    }
    check();
  }, [router]);

  useEffect(()=>{
    async function load(){
      if(!visitId) return;
      const r = await fetch(`/api/visit?id=${visitId}`);
      const j = await r.json();
      setVisit(j.visit);
    }
    load();
  }, [visitId]);

  const blueprint = useMemo(()=> getExamBlueprint(visit?.bodyRegion, visit?.ddxJSON?.ddx || []), [visit]);

  useEffect(()=>{
    if(!visitId) return;
    const raw = localStorage.getItem(`exam2:${visitId}`);
    if(raw){
      try{
        const p = JSON.parse(raw);
        setRom(p.rom||{}); setStrength(p.strength||{}); setOrtho(p.ortho||{}); setNeuro(p.neuro||{}); setFunctional(p.functional||{}); setScores(p.scores||{}); setNotes(p.notes||""); setHypothesis(p.hypothesis||"");
      }catch{}
    }
  }, [visitId]);
  useEffect(()=>{
    if(!visitId) return;
    const t = setTimeout(()=>{
      localStorage.setItem(`exam2:${visitId}`, JSON.stringify({ rom, strength, ortho, neuro, functional, scores, notes, hypothesis }));
    }, 400);
    return ()=>clearTimeout(t);
  }, [visitId, rom, strength, ortho, neuro, functional, scores, notes, hypothesis]);

  async function saveAssessment(){
    if(!visitId) return;
    setSaving(true);
    const body = {
      visitId,
      assessment: {
        activeROM: rom,
        strength,
        orthoTests: ortho,
        neuro: neuro,
        dynamicTests: functional,
        scores,
        clinicianNotes: notes,
        hypothesis
      }
    };
    await fetch("/api/assessment", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    setSaving(false);
    alert("Evaluación guardada.");
  }

  async function generateReport(){
    await saveAssessment();
    const r = await fetch("/api/report", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ visitId }) });
    if(r.ok){ alert("Informe generado y acuse enviado al paciente (si procede)."); }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-xl shadow p-4">
        <h1 className="text-2xl font-bold">Evaluación – {visit?.patient?.firstName} {visit?.patient?.lastName}</h1>
        <p className="text-sm text-gray-600">Zona: {visit?.bodyRegion || "—"}</p>
        {visit?.ddxJSON?.ddx && (
          <div className="mt-2 text-sm">
            <p className="font-medium">Hipótesis IA (top-3):</p>
            <ul className="list-disc ml-5">
              {visit.ddxJSON.ddx.map((d:any,i:number)=>(<li key={i}>{d.label} — {d.prob}%</li>))}
            </ul>
          </div>
        )}
      </div>

      <AnamnesisView data={visit?.intake} />

      <NumericTable title="ROM Activo" rows={blueprint.romRows} values={rom} onChange={setRom} sideLabels={["Izq","Der"]} />

      <NumericTable title="Dinamometría (kg)" rows={blueprint.strengthRows} values={strength} onChange={setStrength} sideLabels={["Izq","Der"]} />

      {blueprint.orthoTests.length>0 && (
        <TestChecklist title="Test ortopédicos sugeridos" tests={blueprint.orthoTests} values={ortho} onChange={setOrtho} />
      )}

      {blueprint.neuroTests.length>0 && (
        <TestChecklist title="Cribado neuro / neural" tests={blueprint.neuroTests} values={neuro} onChange={setNeuro} />
      )}

      {blueprint.functional.length>0 && (
        <TestChecklist title="Tests funcionales" tests={blueprint.functional} values={functional} onChange={setFunctional} />
      )}

      <ScalesPanel bodyRegion={visit?.bodyRegion} values={scores} onChange={setScores} />

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Notas del clínico</h3>
        <textarea className="w-full border rounded-lg p-3" rows={4} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Postura, palpación, hallazgos adicionales…" />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-2">Hipótesis diagnóstica y de daño</h3>
        <textarea className="w-full border rounded-lg p-3" rows={4} value={hypothesis} onChange={e=>setHypothesis(e.target.value)} placeholder="Estructura principal, tisular/no tisular, contribuyentes…" />
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={saveAssessment} disabled={saving} className="px-4 py-3 rounded-xl bg-gray-800 text-white">Guardar</button>
        <button onClick={generateReport} className="px-4 py-3 rounded-xl bg-black text-white">Generar informe</button>
      </div>
    </div>
  );
}
TS

# ========== Email acuse + handoff ==========
cat > pages/api/report.ts <<'TS'
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
TS

cat > pages/handoff.tsx <<'TS'
import { useRouter } from "next/router";

export default function Handoff(){
  const { query } = useRouter();
  return (
    <div className="max-w-md mx-auto p-10 text-center space-y-4">
      <h1 className="text-2xl font-bold">¡Gracias!</h1>
      <p className="text-gray-700">Hemos recibido tu cuestionario. Tu fisioterapeuta lo está revisando ahora.</p>
      <p className="text-gray-700">En un momento, continuaréis juntos con la exploración.</p>
      <p className="text-xs text-gray-500 mt-6">ID de visita: {query.visitId as string || "—"}</p>
    </div>
  );
}
TS

# ========== whoami ==========
cat > pages/api/whoami.ts <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest, res:NextApiResponse){
  const cookie = req.headers.cookie || "";
  const staff = /(^|; )staff=1(;|$)/.test(cookie);
  res.status(200).json({ ok:true, staff });
}
TS

echo "OK: Archivos reparados."
