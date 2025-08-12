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
