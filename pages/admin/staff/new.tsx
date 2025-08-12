import { useRouter } from 'next/router'
import { useState } from 'react'

export default function NewStaffUser() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'fisio'>('fisio')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string>('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const r = await fetch('/api/admin/staff/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, role, password }),
    })
    const j = await r.json()
    if (!r.ok || !j.ok) {
      setErr(j?.error || 'No se pudo crear el usuario')
      return
    }
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white border rounded-2xl p-6 shadow space-y-4">
        <h1 className="text-xl font-bold text-center">Nuevo usuario de staff</h1>

        <label className="block">
          <span className="text-sm">Nombre</span>
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm">Usuario (login)</span>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="ej. maria.garcia" />
        </label>

        <label className="block">
          <span className="text-sm">Email (opcional)</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-1 w-full border rounded-xl px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm">Rol</span>
          <select value={role} onChange={e=>setRole(e.target.value as 'admin'|'fisio')} className="mt-1 w-full border rounded-xl px-3 py-2">
            <option value="fisio">Fisio (acceso clínico, sin datos personales)</option>
            <option value="admin">Admin (permisos completos)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Contraseña</span>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="mt-1 w-full border rounded-xl px-3 py-2" />
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={()=>router.push('/admin')} className="w-1/2 py-3 rounded-xl border">Cancelar</button>
          <button type="submit" className="w-1/2 py-3 rounded-xl bg-black text-white font-semibold">Crear</button>
        </div>
      </form>
    </div>
  )
}
