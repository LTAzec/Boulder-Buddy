import 'server-only'
import { Role } from '@/generated/prisma/client'
import { getSessionId } from '@/lib/sessionUtils'
import { getSessionProfile } from '@/dal/users'

const ROLE_LEVEL: Record<Role, number> = {
  User: 1,
  Setter: 2,
  Admin: 3,
  SuperAdmin: 4,
}

function isRole(value: unknown): value is Role {
  return value === 'User' || value === 'Setter' || value === 'Admin' || value === 'SuperAdmin'
}

/**
 * DEV-FRIENDLY:
 * Leest role uit Bearer JWT payload (zonder signature verify).
 */
function getRoleFromBearer(req?: Request): Role | null {
  const auth = req?.headers.get('authorization') ?? req?.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null

  const token = auth.slice('Bearer '.length).trim()
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8')
    const payload = JSON.parse(payloadJson) as { role?: unknown }
    return isRole(payload.role) ? payload.role : null
  } catch {
    return null
  }
}

async function getCurrentRole(req?: Request): Promise<Role> {
  // 1) Mobile: Bearer token
  const bearerRole = getRoleFromBearer(req)
  if (bearerRole) return bearerRole

  // 2) Web: session cookie
  const sessionId = await getSessionId()
  if (!sessionId) throw new Error('Not authenticated')

  const session = await getSessionProfile(sessionId)
  if (!session) throw new Error('Not authenticated')

  return session.user.role
}

// requireRoleAtLeast(Admin) => Admin of SuperAdmin
export async function requireRoleAtLeast(minRole: Role, req?: Request): Promise<void> {
  const role = await getCurrentRole(req)

  if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
    throw new Error('Forbidden')
  }
}

/**
 * Backwards compatible: lijstje allowed roles.
 * SuperAdmin krijgt automatisch toegang tot alles onder zich.
 * Voorbeeld:
 * - requireRole([Setter]) => Setter, Admin, SuperAdmin OK
 */
export async function requireRole(allowed: Role[], req?: Request): Promise<void> {
  if (allowed.length === 0) throw new Error('Forbidden')

  const minAllowed = allowed.reduce((min, r) => (ROLE_LEVEL[r] < ROLE_LEVEL[min] ? r : min), allowed[0])
  return requireRoleAtLeast(minAllowed, req)
}

// checkt of je setter bent of hoger, en toont de EDIT knoppen indien ja
export async function canSeeAdminUI(minRole: Role = 'Setter'): Promise<boolean> {
  try {
    const role = await getCurrentRole()
    return ROLE_LEVEL[role] >= ROLE_LEVEL[minRole]
  } catch {
    return false
  }
}
