#!/usr/bin/env bash
set -e

echo "→ Creando rutas…"
mkdir -p components pages/staff/visit pages/api/staff-auth pages/exam pages/api

write() { # write <path> then read heredoc
  file="$1"
  shift
  mkdir -p "$(dirname "$file")"
  cat > "$file" <<'EOF'
$CONTENT
EOF
  echo "  • $file"
}

# --- components/AnamnesisView.tsx ---
CONTENT='
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
        <summary className="font-medium cursor-pointer">Antecedentes del problema</summary>
        <div className="mt-2">
          <Row label="Recurrencia" value={f.q27_recurrencia} />
          {f.q27_recurrencia==="Sí" && <Row label="Veces y periodo" value={f.q27a_cuantas} />}
          <Row label="Tratamientos previos" value={f.q28_que_hiciste} />
          <Row label="Pruebas médicas" value={f.q29_pruebas} />
          {f.q29_pruebas==="Sí" && <Row label="Resultados" value={f.q29a_cuales} />}
          <Row label="Medicación por el problema" value={f.q30_meds} />
          {f.q30_meds==="Sí" && <Row label="Cuál/es" value={f.q30a_cuales} />}
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
'
write "components/AnamnesisView.tsx"

# --- pages/staff/login.tsx ---
CONTENT='
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
'
write "pages/staff/login.tsx"

# --- pages/staff/index.tsx ---
CONTENT='
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
'
write "pages/staff/index.tsx"

# --- pages/staff/visit/[id].tsx ---
CONTENT='
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
'
write "pages/staff/visit/[id].tsx"

# --- pages/api/staff-auth/login.ts ---
CONTENT='
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
'
write "pages/api/staff-auth/login.ts"

# --- pages/api/staff-auth/logout.ts ---
CONTENT='
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest,res:NextApiResponse){
  res.setHeader("Set-Cookie", [
    `staff=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
    `staffName=; Path=/; SameSite=Lax; Max-Age=0`
  ]);
  res.status(200).json({ ok:true });
}
'
write "pages/api/staff-auth/logout.ts"

# --- pages/api/visits.ts ---
CONTENT='
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
'
write "pages/api/visits.ts"

# --- pages/api/whoami.ts ---
CONTENT='
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req:NextApiRequest, res:NextApiResponse){
  const cookie = req.headers.cookie || "";
  const staff = /(^|; )staff=1(;|$)/.test(cookie);
  res.status(200).json({ ok:true, staff });
}
'
write "pages/api/whoami.ts"

# --- pages/exam/[visitId].tsx ---
CONTENT='
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
  const [staff, setStaff] = useState<boolean>(false);

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
      setStaff(!!j.staff);
      if(!j.staff){
        router.push("/staff/login");
      }
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
'
write "pages/exam/[visitId].tsx"

# --- pages/api/report.ts (acuse solo) ---
CONTENT='
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
'
write "pages/api/report.ts"

# --- pages/api/whoami.ts ya creado arriba (de nuevo por si acaso) ---

# --- pages/handoff.tsx ---
CONTENT='
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
'
write "pages/handoff.tsx"

# --- pages/intake.tsx (redirige a /handoff) ---
CONTENT='
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import FormRenderer, { Section } from "../components/FormRenderer";
import ProgressBar from "../components/ProgressBar";

function SignaturePad({onChange}:{onChange:(dataUrl:string)=>void}){
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const drawing = useRef(false as boolean);
  function start(e:any){ drawing.current=true; draw(e); }
  function end(){ drawing.current=false; }
  function draw(e:any){
    if(!drawing.current) return;
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const r = c.getBoundingClientRect();
    const src = e.touches? e.touches[0]: e;
    const x = src.clientX - r.left;
    const y = src.clientY - r.top;
    ctx.lineWidth=2; ctx.lineCap="round"; ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
    onChange(c.toDataURL("image/png"));
  }
  function clear(){ const c=canvasRef.current!; c.getContext("2d")!.clearRect(0,0,c.width,c.height); onChange(""); }
  return (
    <div>
      <canvas ref={canvasRef} width={600} height={200}
        onMouseDown={start} onMouseUp={end} onMouseMove={draw}
        onTouchStart={start} onTouchEnd={end} onTouchMove={draw}
        className="w-full border rounded-xl bg-white"/>
      <button type="button" onClick={clear} className="mt-2 underline text-sm">Borrar firma</button>
    </div>
  );
}

export default function Intake(){
  const router = useRouter(); const { visitId } = router.query;
  const [values, setValues] = useState<Record<string,any>>({});
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<"form"|"thinking">("form");

  const sections: Section[] = useMemo(()=>[
    { id:"b1", title:"Datos personales y contacto",
      fields:[
        { id:"q1_nombre", label:"Nombre y apellidos", type:"text", required:true },
        { id:"q2_nacimiento", label:"Fecha de nacimiento", type:"date" },
        { id:"q3_sexo", label:"Sexo", type:"select", options:["Hombre","Mujer","Otro","Prefiero no decirlo"] },
        { id:"q4_altura", label:"Altura (cm)", type:"number", min:80, max:250 },
        { id:"q5_peso", label:"Peso (kg)", type:"number", min:20, max:300 },
        { id:"q6_dominancia", label:"Mano o pie dominante", type:"select", options:["Diestro","Zurdo","Ambidiestro"] },
        { id:"q7_ocupacion", label:"Ocupación actual", type:"textarea" },
        { id:"q8_trabajo", label:"Tu trabajo implica…", type:"multi", options:["Levantar o mover peso habitualmente","Mantenerte de pie muchas horas","Pasar sentado frente a un ordenador","Movimientos repetitivos","Conducción prolongada","Esfuerzo físico intenso","Ninguna de las anteriores"] },
        { id:"q8a_peso_frecuencia", label:"¿Cuánto peso aproximado sueles levantar y cuántas veces al día?", type:"text", showIf:(v)=>Array.isArray(v.q8_trabajo) && v.q8_trabajo.includes("Levantar o mover peso habitualmente") },
        { id:"q8b_ergonomia", label:"¿Usas ajustes ergonómicos?", type:"yesno", showIf:(v)=>Array.isArray(v.q8_trabajo) && v.q8_trabajo.includes("Pasar frente a un ordenador") },
        { id:"q9_deporte", label:"¿Practicas actividad física o deporte?", type:"yesno" },
        { id:"q9a_cuales", label:"¿Cuál/es?", type:"textarea", showIf:(v)=>v.q9_deporte==="Sí" },
        { id:"q9b_frecuencia", label:"¿Con qué frecuencia semanal?", type:"select", options:["1-2 días","3-4 días","5 o más"], showIf:(v)=>v.q9_deporte==="Sí" },
        { id:"q9c_nivel", label:"¿Nivel?", type:"select", options:["Recreativo","Competitivo"], showIf:(v)=>v.q9_deporte==="Sí" },
        { id:"q10_hobbies", label:"Hobbies o actividades de ocio", type:"textarea" },
        { id:"q11_fumas", label:"¿Fumas?", type:"yesno" },
        { id:"q11a_cigs", label:"¿Cuántos cigarrillos/día?", type:"number", min:0, max:100, showIf:(v)=>v.q11_fumas==="Sí" },
        { id:"q12_alcohol", label:"¿Consumes alcohol habitualmente?", type:"yesno" },
        { id:"q13_sueno", label:"Calidad de tu sueño (0-10)", type:"scale", min:0, max:10 },
        { id:"q14_cambio_peso", label:"¿Has notado cambios de peso en 6 meses?", type:"select", options:["Sí, he aumentado","Sí, he bajado","No"] },
        { id:"q14a_cuantos", label:"¿Cuántos kg y en cuánto tiempo?", type:"text", showIf:(v)=>v.q14_cambio_peso==="Sí, he bajado" },
        { id:"email", label:"Email para envío del resumen", type:"text", required:true, placeholder:"tucorreo@dominio.com" }
      ]
    },
    { id:"b2", title:"Motivo de consulta",
      fields:[
        { id:"q15_motivo", label:"¿Qué te trae hoy a consulta?", type:"textarea", required:true },
        { id:"q16_desde_cuando_num", label:"¿Desde cuándo? (número)", type:"number", min:0 },
        { id:"q16_desde_cuando_ud", label:"Unidad de tiempo", type:"select", options:["días","semanas","meses","años"] },
        { id:"q17_como_empezo", label:"¿Cómo empezó?", type:"select", options:["De forma repentina con un golpe o accidente","Poco a poco sin causa clara","Después de un esfuerzo","Otro"] },
        { id:"q17a_golpe", label:"Describe qué ocurrió y los síntomas", type:"textarea", showIf:(v)=>v.q17_como_empezo==="De forma repentina con un golpe o accidente" },
        { id:"q18_donde", label:"¿Dónde notas el síntoma principal?", type:"text" },
        { id:"q19_irradia", label:"¿El dolor se queda o se extiende?", type:"select", options:["Se queda","Se extiende"] },
        { id:"q19a_a_donde", label:"¿Hacia dónde?", type:"textarea", showIf:(v)=>v.q19_irradia==="Se extiende" },
        { id:"q20_tipo", label:"Tipo de dolor", type:"multi", options:["Punzante","Quemante","Eléctrico","Opresivo","Sordo","Pulsátil","Otro"] },
        { id:"q21_intensidad", label:"Intensidad de dolor (0-10)", type:"scale", min:0, max:10 },
        { id:"q22_constante", label:"¿Es constante o intermitente?", type:"select", options:["Constante","Intermitente"] },
        { id:"q22a_frec", label:"¿Con qué frecuencia/duración?", type:"text", showIf:(v)=>v.q22_constante==="Intermitente" },
        { id:"q23_empeora", label:"¿Cuándo empeora?", type:"textarea" },
        { id:"q24_mejora", label:"¿Cuándo mejora?", type:"textarea" },
        { id:"q25_rigidez", label:"¿Rigidez al despertar?", type:"yesno" },
        { id:"q25a_rigidez_min", label:"¿Cuántos minutos?", type:"number", min:0, showIf:(v)=>v.q25_rigidez==="Sí" },
        { id:"q26_dolor_noche", label:"¿Dolor nocturno?", type:"yesno" },
        { id:"q26a_mejora_postura", label:"¿Mejora al cambiar de postura?", type:"yesno", showIf:(v)=>v.q26_dolor_noche==="Sí" },
      ]
    },
    { id:"b3", title:"Antecedentes del problema",
      fields:[
        { id:"q27_recurrencia", label:"¿Has tenido este problema antes?", type:"yesno" },
        { id:"q27a_cuantas", label:"¿Cuántas veces y en qué periodo?", type:"text", showIf:(v)=>v.q27_recurrencia==="Sí" },
        { id:"q28_que_hiciste", label:"¿Qué has hecho para tratarlo?", type:"textarea" },
        { id:"q29_pruebas", label:"¿Pruebas médicas?", type:"yesno" },
        { id:"q29a_cuales", label:"¿Cuáles y resultados?", type:"textarea", showIf:(v)=>v.q29_pruebas==="Sí" },
        { id:"q30_meds", label:"¿Medicación para este problema?", type:"yesno" },
        { id:"q30a_cuales", label:"¿Cuál/es y frecuencia?", type:"textarea", showIf:(v)=>v.q30_meds==="Sí" },
      ]
    },
    { id:"b4", title:"Síntomas asociados (seguridad)",
      fields:[
        { id:"q31_fiebre", label:"¿Fiebre/escalofríos/sudores nocturnos?", type:"yesno" },
        { id:"q32_peso", label:"¿Pérdida de peso sin causa?", type:"yesno" },
        { id:"q33_cancer", label:"¿Antecedentes de cáncer?", type:"yesno" },
        { id:"q34_debilidad", label:"¿Debilidad en brazos o piernas?", type:"yesno" },
        { id:"q35_hormigueo", label:"¿Hormigueos o pérdida de sensibilidad?", type:"yesno" },
        { id:"q35a_donde", label:"¿Dónde?", type:"text", showIf:(v)=>v.q35_hormigueo==="Sí" },
        { id:"q36_esfinteres", label:"¿Dificultad con orina o heces?", type:"yesno" },
        { id:"q37_silla", label:"¿Adormecimiento en zona genital?", type:"yesno" },
        { id:"q38_invariante", label:"¿Dolor que no cambia con postura?", type:"yesno" },
        { id:"q39_pecho", label:"¿Dolor en el pecho / palpitaciones?", type:"yesno" },
      ]
    },
    { id:"b5", title:"Limitaciones y vida diaria",
      fields:[
        { id:"q40_limitaciones", label:"¿Actividades que te cuesta hacer?", type:"textarea" },
        { id:"q41_trabajo_afecta", label:"¿Te afecta para trabajar?", type:"yesno" },
        { id:"q41a_como", label:"Describe cómo", type:"textarea", showIf:(v)=>v.q41_trabajo_afecta==="Sí" },
        { id:"q42_deporte_dejado", label:"¿Has dejado algún deporte/hobby?", type:"yesno" },
        { id:"q42a_cuales", label:"¿Cuál/es?", type:"textarea", showIf:(v)=>v.q42_deporte_dejado==="Sí" },
        { id:"q43_ayudas", label:"¿Usas alguna ayuda (bastón, faja, rodillera)?", type:"yesno" },
      ]
    },
    { id:"b6", title:"Antecedentes médicos",
      fields:[
        { id:"q44_enfermedades", label:"¿Enfermedades diagnosticadas?", type:"textarea" },
        { id:"q45_cirugias", label:"¿Cirugías o lesiones importantes?", type:"textarea" },
        { id:"q46_familia", label:"¿Antecedentes familiares relevantes?", type:"textarea" },
        { id:"q47_med_habitual", label:"¿Medicación habitual?", type:"yesno" },
        { id:"q47a_cuales", label:"¿Cuál/es?", type:"textarea", showIf:(v)=>v.q47_med_habitual==="Sí" },
        { id:"q48_alergias", label:"Alergias conocidas", type:"textarea" },
      ]
    },
    { id:"b7", title:"Motivación y expectativas",
      fields:[
        { id:"q49_emocion", label:"¿Cómo te sientes por este problema?", type:"select", options:["tranquilo/a","algo preocupado/a","muy preocupado/a","desesperado/a"] },
        { id:"q50_kinesiophobia", label:"¿Temes moverte por miedo a empeorar?", type:"yesno" },
        { id:"q51_creencia", label:"¿Qué crees que lo causa?", type:"textarea" },
        { id:"q52_esperas", label:"¿Qué esperas conseguir?", type:"textarea" },
        { id:"q53_compromiso", label:"Compromiso (0–10)", type:"scale", min:0, max:10 },
        { id:"q54_objetivo", label:"Si te recuperas, ¿qué harías primero?", type:"textarea" },
        { id:"q55_por_que_ahora", label:"¿Por qué ahora?", type:"textarea" },
        { id:"q56_cambio_vida", label:"Si desaparece, ¿cómo cambiaría tu vida?", type:"textarea" },
        { id:"q57_urgencia", label:"Urgencia (0–10)", type:"scale", min:0, max:10 },
        { id:"q58_afectacion", label:"Afectación a calidad de vida (0–10)", type:"scale", min:0, max:10 },
        { id:"q59_si_no_haces", label:"¿Qué pasaría si no haces nada?", type:"textarea" },
        { id:"q60_otras_sol", label:"¿Has intentado otras soluciones?", type:"yesno" },
        { id:"q60a_cuales", label:"¿Cuáles y resultado?", type:"textarea", showIf:(v)=>v.q60_otras_sol==="Sí" },
        { id:"q61_dispuesto", label:"¿Cuánto estás dispuesto/a a invertir?", type:"select", options:["Haría lo que sea necesario","Estoy dispuesto/a a hacer cambios importantes","Solo si es algo rápido y sin mucho esfuerzo","No lo tengo claro"] },
        { id:"q62_barreras", label:"¿Qué podría impedir seguir el programa?", type:"multi", options:["Falta de tiempo","Falta de dinero","Falta de constancia","Miedo a no mejorar","No me gusta hacer ejercicio","Otra"] },
        { id:"q63_depende", label:"Si el tratamiento te da confianza, ¿lo empezarías ya?", type:"select", options:["Sí","No","Depende"] },
        { id:"q63a_de_que", label:"¿De qué dependería?", type:"textarea", showIf:(v)=>v.q63_depende==="Depende" },
      ]
    },
  ], []);

  const totalSteps = sections.length + 1;
  const percent = Math.round((step) / (totalSteps - 1) * 100);

  const storageKey = typeof window !== "undefined" && visitId ? `intake:${visitId}` : null;
  useEffect(()=>{
    if(!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if(raw){
      try{
        const parsed = JSON.parse(raw);
        setValues(parsed.values || {});
        setAccepted(!!parsed.accepted);
        setSignature(parsed.signature || "");
        setStep(Number.isFinite(parsed.step)? parsed.step: 0);
      }catch{}
    }
  }, [storageKey]);
  useEffect(()=>{
    if(!storageKey) return;
    const t = setTimeout(()=>{
      localStorage.setItem(storageKey, JSON.stringify({ values, accepted, signature, step }));
    }, 400);
    return ()=>clearTimeout(t);
  }, [values, accepted, signature, step, storageKey]);

  const privacyText = `Autorizo a Clínica Podium al tratamiento de mis datos de salud y envío del acuse por email (RGPD/LOPDGDD).`;

  function goNext(){ if(step < sections.length - 1) setStep(s=>s+1); else setStep(sections.length); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function goPrev(){ setStep(s=>Math.max(0, s-1)); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function onSubmit(e:any){
    e.preventDefault(); if(!visitId){ alert("Falta visitId en la URL"); return; }
    if(!values.email){ alert("El email es obligatorio"); setStep(0); return; }
    if(!accepted || !signature){ alert("Debes aceptar y firmar el consentimiento"); setStep(sections.length); return; }
    setSaving(true); setStage("thinking");

    const flags:string[] = [];
    if(["q31_fiebre","q32_peso","q33_cancer","q36_esfinteres","q37_silla","q39_pecho"].some(k=>values[k]==="Sí")) flags.push("RED_FLAG");
    if(values.q19_irradia==="Se extiende") flags.push("RADIATING_PAIN");
    if(values.q25_rigidez==="Sí" && Number(values.q25a_rigidez_min||0) > 30) flags.push("STIFFNESS_>30MIN");
    if(Number(values.q53_compromiso||0) < 5) flags.push("LOW_ADHERENCE");
    if(Number(values.q57_urgencia||0) >=8 && Number(values.q58_afectacion||0) >=8) flags.push("HIGH_URGENCY_IMPACT");
    const intake = { ...values, _flags: flags };

    await fetch("/api/patient",{ method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ visitId, intake }) });
    await fetch("/api/dx",{ method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ visitId }) });
    await fetch("/api/consent",{ method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ visitId, email: values.email, signaturePng: signature, privacyText }) });
    await fetch("/api/report", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ visitId }) });

    setSaving(false);
    router.push(`/handoff?visitId=${visitId}`);
  }

  if(stage==="thinking"){
    return (
      <div className="max-w-xl mx-auto p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Gracias. Guardando tu cuestionario…</h1>
        <p className="text-gray-600">En un momento, tu fisioterapeuta continuará contigo.</p>
        <div className="animate-pulse h-3 bg-gray-200 rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-3xl mx-auto p-4">
      <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Anamnesis – Clínica Podium</h1>
          <div className="w-40"><ProgressBar percent={percent} /></div>
        </div>
        <p className="text-xs text-gray-600 mt-1">Progreso: {percent}%</p>
      </div>

      {step < sections.length ? (
        <FormRenderer sections={[sections[step]]} values={values} onChange={setValues} />
      ) : (
        <section className="bg-white p-4 rounded-xl shadow space-y-2">
          <h2 className="text-lg font-semibold">Consentimiento RGPD/LOPDGDD</h2>
          <p className="text-sm text-gray-700">
            Autorizo a Clínica Podium al tratamiento de mis datos de salud con fines asistenciales y envío del acuse por email.
          </p>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} /> <span>Acepto el tratamiento y el envío por email</span>
          </label>
          <SignaturePad onChange={setSignature}/>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={goPrev} disabled={step===0} className={`px-4 py-3 rounded-xl border ${step===0? "opacity-40 cursor-not-allowed":"bg-white"}`}>
          ← Atrás
        </button>
        {step < sections.length ? (
          <button type="button" onClick={goNext} className="px-4 py-3 rounded-xl bg-black text-white font-semibold">
            Seguimos →
          </button>
        ) : (
          <button type="submit" disabled={saving} className="px-4 py-3 rounded-xl bg-black text-white font-semibold w-40">
            {saving?"Enviando…":"Enviar"}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Guardado automático activado · Si cierras la página, podrás continuar después.
      </p>
    </form>
  );
}
'
write "pages/intake.tsx"

echo "→ Listo."
