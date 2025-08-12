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
