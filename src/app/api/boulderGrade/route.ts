import { NextResponse } from 'next/server'
import { BoulderGrade } from '@/generated/prisma/enums'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} satisfies HeadersInit

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET() {
  return NextResponse.json({ ok: true, grades: Object.values(BoulderGrade) }, { headers: corsHeaders })
}
