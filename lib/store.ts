// lib/store.ts
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'crypto'

/* =========================
 * Tipos
 * ========================= */
export type StaffRole = 'admin' | 'fisio' | 'aux'

export interface StaffUser {
  id: string
  name: string
  username: string // SIEMPRE en minúsculas
  email?: string
  role: StaffRole
  salt: string
  passwordHash: string // hash hex
  active: boolean
  createdAt: string
}

export interface Visit {
  id: string
  createdAt: string
  bodyRegion?: string
  patient?: { firstName?: string; lastName?: string; email?: string; phone?: string }
  intake?: Record<string, unknown>
  ddxJSON?: { ddx: Array<{ label: string; prob: number; why?: string }> }
  consent?: {
    email: string
    text: string
    signaturePng: string
    at: string
  }
}

interface Store {
  visits: Record<string, Visit>
  staff: Record<string, StaffUser> // by id
  staffByUsername: Record<string, string> // username -> id
}

/* =========================
 * Store in-memory global
 * ========================= */
declare global {
  // eslint-disable-next-line no-var
  var __PODIUM_STORE: Store | undefined
}
const defaultStore: Store = { visits: {}, staff: {}, staffByUsername: {} }

export function getStore(): Store {
  if (!global.__PODIUM_STORE) global.__PODIUM_STORE = defaultStore
  return global.__PODIUM_STORE
}

/* =========================
 * VISITS
 * ========================= */
export function getOrCreateVisit(id: string): Visit {
  const s = getStore()
  if (!s.visits[id]) s.visits[id] = { id, createdAt: new Date().toISOString() }
  return s.visits[id]
}

export function saveVisit(v: Visit) {
  const s = getStore()
  s.visits[v.id] = v
}

export function listVisits(): Visit[] {
  return Object.values(getStore().visits).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
}

/* =========================
 * Password helpers
 * ========================= */
// Hash fuerte por defecto (scrypt). Mantenemos compatibilidad con HMAC-SHA256 legacy.
function hashPasswordScrypt(password: string, salt?: string) {
  const realSalt = salt || randomBytes(16).toString('hex')
  const hash = scryptSync(password, realSalt, 64).toString('hex')
  return { salt: realSalt, hash }
}

// LEGACY (usado en versiones previas)
function hashPasswordHmac(password: string, salt: string) {
  return createHmac('sha256', salt).update(password).digest('hex')
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase()
}

/* =========================
 * STAFF: CRUD + auth
 * ========================= */
export function createStaffUser(input: {
  name: string
  username: string
  email?: string
  role: StaffRole
  password: string
}): StaffUser {
  const s = getStore()
  const u = normalizeUsername(input.username)
  if (!u) throw new Error('username requerido')
  if (s.staffByUsername[u]) throw new Error('username ya existe')

  const { salt, hash } = hashPasswordScrypt(input.password)
  const id = `usr_${randomBytes(6).toString('hex')}`

  const user: StaffUser = {
    id,
    name: input.name.trim(),
    username: u,
    email: input.email?.trim(),
    role: input.role,
    salt,
    passwordHash: hash,
    active: true,
    createdAt: new Date().toISOString(),
  }

  s.staff[id] = user
  s.staffByUsername[u] = id
  return user
}

export function listStaffUsers(): StaffUser[] {
  return Object.values(getStore().staff).sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
}

export function getStaffById(id: string): StaffUser | undefined {
  return getStore().staff[id]
}

export function getStaffByUsername(username: string): StaffUser | undefined {
  const s = getStore()
  const id = s.staffByUsername[normalizeUsername(username)]
  return id ? s.staff[id] : undefined
}

export function countAdmins(): number {
  return listStaffUsers().filter(u => u.role === 'admin').length
}

export function setStaffRole(id: string, role: StaffRole) {
  const s = getStore()
  const u = s.staff[id]
  if (!u) throw new Error('Usuario no encontrado')
  // Evitar quedarnos sin administradores
  if (u.role === 'admin' && role !== 'admin' && countAdmins() <= 1) {
    throw new Error('Debe quedar al menos un administrador')
  }
  u.role = role
}

export function setStaffActive(id: string, active: boolean) {
  const u = getStaffById(id)
  if (!u) throw new Error('Usuario no encontrado')
  // No permitir dejar inactivo al último admin
  if (u.role === 'admin' && !active && countAdmins() <= 1) {
    throw new Error('Debe quedar al menos un administrador activo')
  }
  u.active = active
}

export function updateStaffProfile(id: string, patch: Partial<Pick<StaffUser, 'name' | 'email' | 'username'>>) {
  const s = getStore()
  const u = s.staff[id]
  if (!u) throw new Error('Usuario no encontrado')

  if (typeof patch.name === 'string') u.name = patch.name.trim()
  if (typeof patch.email !== 'undefined') u.email = patch.email?.trim()

  if (typeof patch.username === 'string') {
    const newU = normalizeUsername(patch.username)
    if (newU && newU !== u.username) {
      if (s.staffByUsername[newU]) throw new Error('username ya existe')
      // actualizar índice username -> id
      delete s.staffByUsername[u.username]
      u.username = newU
      s.staffByUsername[newU] = id
    }
  }
}

export function changeStaffPassword(id: string, newPassword: string) {
  const u = getStaffById(id)
  if (!u) throw new Error('Usuario no encontrado')
  const { salt, hash } = hashPasswordScrypt(newPassword)
  u.salt = salt
  u.passwordHash = hash
}

export function deleteStaff(id: string, opts?: { allowDeleteLastAdmin?: boolean }) {
  const s = getStore()
  const u = s.staff[id]
  if (!u) return
  if (u.role === 'admin' && !opts?.allowDeleteLastAdmin && countAdmins() <= 1) {
    throw new Error('Debe quedar al menos un administrador')
  }
  delete s.staffByUsername[u.username]
  delete s.staff[id]
}

export function verifyStaffCredentials(username: string, password: string): StaffUser | null {
  const user = getStaffByUsername(username)
  if (!user || !user.active) return null

  // 1) Intento con scrypt (actual)
  const scryptHash = hashPasswordScrypt(password, user.salt).hash
  if (timingSafeEqual(Buffer.from(scryptHash, 'hex'), Buffer.from(user.passwordHash, 'hex'))) {
    return user
  }

  // 2) Compatibilidad con hash legacy HMAC-SHA256
  const legacyHash = hashPasswordHmac(password, user.salt)
  if (timingSafeEqual(Buffer.from(legacyHash, 'hex'), Buffer.from(user.passwordHash, 'hex'))) {
    return user
  }

  return null
}

/* =========================
 * Bootstrap admin (si falta)
 * ========================= */
;(function bootstrapAdmin() {
  const existingAdmin = listStaffUsers().find(u => u.role === 'admin')
  if (existingAdmin) return

  const EMAIL = process.env.ADMIN_EMAIL || 'admin@podium.local'
  const USER = (EMAIL.split('@')[0] || 'admin').toLowerCase()
  const PASS = process.env.ADMIN_PASSWORD || 'podium123'

  try {
    createStaffUser({
      name: 'Administrador',
      username: USER,
      email: EMAIL,
      role: 'admin',
      password: PASS,
    })
    // eslint-disable-next-line no-console
    console.log(`[store] Admin inicial creado: ${USER} / ${EMAIL}`)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[store] No se pudo crear admin inicial:', (e as Error).message)
  }
})()
