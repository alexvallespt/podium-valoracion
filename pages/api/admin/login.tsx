import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@podium.local');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr('');
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!r.ok || j?.ok === false) {
      setErr(j?.error || 'Error de login');
      return;
    }
    router.push('/admin');
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Login Administrador</h1>
      <form onSubmit={onSubmit} className="space-y-3 bg-white p-4 rounded-xl border">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full bg-black text-white rounded-lg py-2">Entrar</button>
      </form>
      <p className="text-center text-sm">
        <Link href="/" className="underline">← Volver a la home</Link>
      </p>
    </div>
  );
}
