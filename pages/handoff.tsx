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
