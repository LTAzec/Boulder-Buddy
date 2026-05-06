import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {prismaClient} from '@/dal/prismaClient'

export async function POST() {
  const c = await cookies()
  const sessionId = c.get('sessionId')?.value

  if (sessionId) {
    await prismaClient.session.update({
      where: {id: sessionId},
      data: {activeUntil: new Date()},
    })
  }

  c.delete('sessionId')
  return NextResponse.json({ok: true})
}
