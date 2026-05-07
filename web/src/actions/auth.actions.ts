'use server'

import { cookies } from 'next/headers'
import { prismaClient } from '@/dal/prismaClient'
import { createStatefulJwtToken } from '@/lib/jwtUtils'
import { verifyPassword } from '@/lib/passwordUtils'

type ActionOk<T> = { ok: true; data: T }
type ActionFail = { ok: false; error: string }
type ActionResult<T> = ActionOk<T> | ActionFail

export async function loginStateful(email: string, password: string): Promise<ActionResult<null>> {
  try {
    const user = await prismaClient.user.findUnique({ where: { email } })
    if (!user) return { ok: false, error: 'Invalid credentials' }

    const ok = verifyPassword(user.password, password)
    if (!ok) return { ok: false, error: 'Invalid credentials' }

    // session in DB (24u)
    const activeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const session = await prismaClient.session.create({
      data: { userId: user.id, activeUntil },
      include: { user: true }, // nodig voor createStatefulJwtToken
    })

    const token = createStatefulJwtToken(session)

    const cookieStore = await cookies()
    cookieStore.set('auth_stateful', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return { ok: true, data: null }
  } catch {
    return { ok: false, error: 'Login failed' }
  }
}

export async function logoutStateful(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_stateful', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  })
}
