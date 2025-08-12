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
