import type {Profile, SessionWithProfile} from '@/models/users'
import {cookies} from 'next/headers'
import type {Role} from '@/generated/prisma/client'
import {extendSession, getSessionProfile} from '@/dal/users'
import type {StatefulJwtTokenBody} from '@/lib/jwtUtils'
import {createStatefulJwtToken, validateStatefulJwtToken} from '@/lib/jwtUtils'

// *********************************************************************************************************************
//                                                   UTILS
// *********************************************************************************************************************

export async function getSessionFromCookie(stateful = true): Promise<SessionWithProfile | null> {
  if (stateful) {
    const sessionId = await getSessionId()
    if (!sessionId) return null

    const session = await getSessionProfile(sessionId)
    if (!session) {
      await clearSessionCookie()
      return null
    }

    // sliding refresh (maar veilig als extendSession null zou teruggeven)
    await extendSessionAndSetCookie(session.id, session.user.role)

    return session
  }

  const tokenBody = await getJwtBody()
  if (!tokenBody) return null

  return {
    id: tokenBody.sessionId,
    userId: tokenBody.sub,
    user: {
      id: tokenBody.sub,
      email: tokenBody.email,
      username: tokenBody.username,
      role: tokenBody.role,
    },
    activeFrom: new Date(tokenBody.iat * 1000),
    activeUntil: new Date(tokenBody.exp * 1000),
  }
}

export async function getSessionProfileFromCookie(stateful = true): Promise<Profile | null> {
  const session = await getSessionFromCookie(stateful)
  return session?.user ?? null
}

export async function getSessionProfileFromCookieOrThrow(stateful = true): Promise<Profile> {
  const session = await getSessionFromCookie(stateful)
  if (!session) {
    throw new Error("Couldn't retrieve the user's profile in getSessionProfileFromCookieOrThrow.")
  }
  return session.user
}

/**
 * Extend de session en update de cookie.
 * BELANGRIJK: jouw extendSession(...) kan (volgens TS) null teruggeven, dus we checken dat hier.
 */
export async function extendSessionAndSetCookie(id: string, role: Role): Promise<void> {
  const extendedSession = await extendSession(id, role)

  // ✅ fix voor jouw TS-error
  if (!extendedSession) {
    await clearSessionCookie()
    return
  }

  await setSessionCookie(extendedSession)
}

// *********************************************************************************************************************
//                                                   COOKIES
// *********************************************************************************************************************

const cookieName = 'sessionId'

export async function setSessionCookie(session: SessionWithProfile): Promise<void> {
  const awaitedCookies = await cookies()
  const jwt = createStatefulJwtToken(session)

  awaitedCookies.set({
    name: cookieName,
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: session.activeUntil,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const awaitedCookies = await cookies()
  awaitedCookies.delete(cookieName)
}

export async function getSessionId(): Promise<string | undefined> {
  const jwt = (await cookies()).get(cookieName)?.value
  if (!jwt) return undefined
  return validateStatefulJwtToken(jwt)?.sessionId
}

export async function getJwtBody(): Promise<StatefulJwtTokenBody | undefined> {
  const jwt = (await cookies()).get(cookieName)?.value
  if (!jwt) return undefined
  return validateStatefulJwtToken(jwt)
}
