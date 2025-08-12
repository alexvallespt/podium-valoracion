import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type PatientResp = {
  ok: boolean;
  error?: string;
  patient?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    createdAt: number;
    visitIds: string[];
    intakes: { at: number; visitId: string; data: Record<string, unknown> }[];
  };
};

export default function PatientPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<PatientResp | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    (async () => {
      const r = await fetch(`/api/patients/${id}`);
      if (r.status === 401 || r.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      const j = (await r.json()) as PatientResp;
      setData(j);
    })();
  }, [id]);

  if (!data) return <div className="max-w-3xl mx-auto p-6">Cargando…</div>;
  if (!data.ok || !data.patient) return <div className="max-w-3xl mx-auto p-6 text-red-600">Error: {data.error || 'No disponible'}</div>;

  const p = data.patient;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ficha del paciente</h1>
        <Link className="underline" href="/admin">← Panel</Link>
      </div>

      <section className="bg-white p-4 rounded-xl border">
        <div className="text-lg font-semibold">{p.name}</div>
        <div className="text-sm opacity-70">Creado: {new Date(p.createdAt).toLocaleString()}</div>
        <div className="mt-2 text-sm">
          <div>Email: {p.email ?? <span className="opacity-60">No visible para STAFF</span>}</div>
          <div>Teléfono: {p.phone ?? <span className="opacity-60">No visible para STAFF</span>}</div>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl border">
        <h2 className="font-semibold mb-2">Anamnesis (histórico)</h2>
        <ul className="space-y-2">
          {p.intakes.map((it, i) => (
            <li key={i} className="border rounded p-3">
              <div className="text-sm opacity-70 mb-1">
                {new Date(it.at).toLocaleString()} · visita {it.visitId}
              </div>
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(it.data, null, 2)}</pre>
            </li>
          ))}
          {p.intakes.length === 0 && <li className="text-sm opacity-70">Sin registros</li>}
        </ul>
      </section>
    </div>
  );
}
