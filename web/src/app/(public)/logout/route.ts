import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL('/login', request.url)
  const res = NextResponse.redirect(url)

  // JWT cookie (nieuw systeem)
  res.cookies.set('auth_stateful', '', { path: '/', expires: new Date(0) })

  // Session cookie (oud systeem)
  res.cookies.set('sessionId', '', { path: '/', expires: new Date(0) })

  return res
}
