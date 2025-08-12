// pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  createStaffUser,
  listStaffUsers,
  deleteStaff,
  setStaffRole,
  setStaffActive,
  updateStaffProfile,
  changeStaffPassword,
  getStaffByUsername,
  countAdmins,
  type StaffRole,
} from '../../../lib/store'

// --- helpers --------------------------------------------------------------
function parseCookies(header?: string) {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (!k) continue
    out[k] = decodeURIComponent(rest.join('=') || '')
  }
  return out
}

function requireAdmin(req: NextApiRequest) {
  const cookies = parseCookies(req.headers.cookie)
  const role = cookies['staff_role']
  const username = cookies['staff_username'] || ''
  return role === 'admin' ? { username } : null
}

function sanitizeUser(u: ReturnType<typeof listStaffUsers>[number]) {
  // No exponemos salt/hash
  const { salt: _s, passwordHash: _p, ...safe } = u
  return safe
}

// --- handler --------------------------------------------------------------
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const me = requireAdmin(req)
  if (!me) return res.status(403).json({ ok: false, error: 'Solo administrador' })

  try {
    // GET: listar usuarios
    if (req.method === 'GET') {
      const users = listStaffUsers().map(sanitizeUser)
      return res.status(200).json({ ok: true, users })
    }

    // POST: crear usuario
    if (req.method === 'POST') {
      const { name, username, email, role, password } = req.body || {}
      if (!name || !username || !role || !password) {
        return res.status(400).json({ ok: false, error: 'Faltan campos obligatorios' })
      }
      const validRoles: StaffRole[] = ['admin', 'fisio', 'aux']
      if (!validRoles.includes(role as StaffRole)) {
        return res.status(400).json({ ok: false, error: 'Rol no válido' })
      }
      const user = createStaffUser({
        name: String(name),
        username: String(username),
        email: email ? String(email) : undefined,
        role: role as StaffRole,
        password: String(password),
      })
      return res.status(200).json({ ok: true, user: sanitizeUser(user) })
    }

    // PATCH: actualizar perfil/rol/estado/contraseña
    if (req.method === 'PATCH') {
      const { username, patch } = (req.body || {}) as {
        username?: string
        patch?: {
          name?: string
          email?: string
          newUsername?: string
          role?: StaffRole
          active?: boolean
          password?: string
        }
      }
      if (!username || !patch) {
        return res.status(400).json({ ok: false, error: 'Faltan parámetros' })
      }

      const user = getStaffByUsername(String(username))
      if (!user) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' })

      // Perfil (name/email/username)
      if (patch.name !== undefined || patch.email !== undefined || patch.newUsername !== undefined) {
        updateStaffProfile(user.id, {
          name: patch.name,
          email: patch.email,
          username: patch.newUsername,
        })
      }

      // Rol
      if (patch.role) {
        setStaffRole(user.id, patch.role)
      }

      // Estado activo/inactivo
      if (typeof patch.active === 'boolean') {
        setStaffActive(user.id, patch.active)
      }

      // Contraseña
      if (patch.password) {
        changeStaffPassword(user.id, patch.password)
      }

      return res.status(200).json({ ok: true })
    }

    // DELETE: borrar usuario
    if (req.method === 'DELETE') {
      // username puede venir en query o body
      const username =
        (req.query.username as string) ||
        ((req.body || {}).username as string) ||
        ''
      if (!username) return res.status(400).json({ ok: false, error: 'Falta username' })

      // No permitir borrarse a sí mismo
      if (me.username && me.username.toLowerCase() === String(username).toLowerCase()) {
        return res.status(400).json({ ok: false, error: 'No puedes borrarte a ti mismo' })
      }

      const user = getStaffByUsername(username)
      if (!user) return res.status(404).json({ ok: false, error: 'Usuario no encontrado' })

      // Protección adicional: no dejar el sistema sin administradores
      if (user.role === 'admin' && countAdmins() <= 1) {
        return res.status(400).json({ ok: false, error: 'Debe quedar al menos un administrador' })
      }

      deleteStaff(user.id)
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message || 'Error interno' })
  }
}
