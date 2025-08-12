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
