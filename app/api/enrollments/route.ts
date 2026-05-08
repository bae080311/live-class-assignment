import 'server-only'
import { NextResponse } from 'next/server'
import { createEnrollment, ServiceError } from '@/lib/services/enrollment'
import { ERROR_CODES } from '@/lib/schemas/enrollment'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = createEnrollment(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { code: ERROR_CODES.SERVER_ERROR, message: '신청 처리 중 오류가 발생했어요.' },
      { status: 500 }
    )
  }
}
