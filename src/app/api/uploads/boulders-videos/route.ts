import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'
import { requireRole } from '@/lib/requireRole'
import { Role } from '@/generated/prisma/client'


export const runtime = 'nodejs'

// bv. 100 MB 
const MAX_BYTES = 100 * 1024 * 1024
const ALLOWED_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

function extFromMime(mime: string) {
  switch (mime) {
    case 'video/mp4':
      return 'mp4'
    case 'video/webm':
      return 'webm'
    case 'video/quicktime':
      return 'mov'
    default:
      return null
  }
}

export async function POST(req: Request) {
  try {
    await requireRole([Role.Setter, Role.Admin], req)

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ ok: false, error: `Invalid file type: ${file.type}` }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: `File too large. Max ${MAX_BYTES} bytes` },
        { status: 400 },
      )
    }

    const ext = extFromMime(file.type)
    if (!ext) {
      return NextResponse.json({ ok: false, error: 'Could not determine file extension' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // public/uploads/boulders-videos/<uuid>.<ext>
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'boulders-videos')
    await fs.mkdir(uploadsDir, { recursive: true })

    const filename = `${randomUUID()}.${ext}`
    const absolutePath = path.join(uploadsDir, filename)

    await fs.writeFile(absolutePath, buffer)

    const url = `/uploads/boulders-videos/${filename}`
    return NextResponse.json({ ok: true, url })
  } catch (err: any) {
    console.error('Boulder video upload failed', err)
    const msg = err?.message ?? 'Internal server error'
    if (msg === 'Unauthorized') return NextResponse.json({ ok: false, error: msg }, { status: 401 })
    if (msg === 'Forbidden') return NextResponse.json({ ok: false, error: msg }, { status: 403 })

    const payload: any = { ok: false, error: msg }
    if (process.env.NODE_ENV !== 'production') payload.stack = err?.stack
    return NextResponse.json(payload, { status: 500 })
  }
}
