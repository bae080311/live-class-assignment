import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { transaction } from '@/lib/db'
import type { Enrollment } from '@/lib/db'
import {
  Step1Schema,
  Step2PersonalSchema,
  Step2GroupSchema,
  Step3Schema,
  ERROR_CODES,
} from '@/lib/schemas/enrollment'

class RouteError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

type RequestBody = {
  courseId?: string
  type?: string
  applicant?: {
    name?: string
    email?: string
    phone?: string
    motivation?: string
  }
  group?: {
    organizationName?: string
    headCount?: number
    participants?: { name: string; email: string }[]
    contactPerson?: string
  }
  agreedToTerms?: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody

    const step1 = Step1Schema.safeParse({ courseId: body.courseId, type: body.type })
    if (!step1.success) {
      return NextResponse.json(
        { code: ERROR_CODES.INVALID_INPUT, message: '입력값이 올바르지 않아요.', details: z.flattenError(step1.error).fieldErrors },
        { status: 400 }
      )
    }

    const step2Error = (err: z.ZodError) =>
      NextResponse.json(
        { code: ERROR_CODES.INVALID_INPUT, message: '신청자 정보가 올바르지 않아요.', details: z.flattenError(err).fieldErrors },
        { status: 400 }
      )

    const applicantInput = {
      name: body.applicant?.name,
      email: body.applicant?.email,
      phone: body.applicant?.phone,
      ...(body.applicant?.motivation ? { motivation: body.applicant.motivation } : {}),
    }

    let applicant: Enrollment['applicant']
    let group: Enrollment['group']

    if (step1.data.type === 'group') {
      const step2 = Step2GroupSchema.safeParse({
        ...applicantInput,
        organizationName: body.group?.organizationName,
        headCount: body.group?.headCount,
        participants: body.group?.participants,
        contactPerson: body.group?.contactPerson,
      })
      if (!step2.success) return step2Error(step2.error)
      const { organizationName, headCount, participants, contactPerson, ...base } = step2.data
      applicant = base
      group = { organizationName, headCount, participants, contactPerson }
    } else {
      const step2 = Step2PersonalSchema.safeParse(applicantInput)
      if (!step2.success) return step2Error(step2.error)
      applicant = step2.data
    }

    const step3 = Step3Schema.safeParse({ agreed: body.agreedToTerms })
    if (!step3.success) {
      return NextResponse.json(
        { code: ERROR_CODES.INVALID_INPUT, message: '약관 동의가 필요해요.' },
        { status: 400 }
      )
    }

    const { courseId, type } = step1.data
    const now = new Date().toISOString()
    const enrollmentId = `ENR-${Date.now()}`

    const enrollment = transaction(db => {
      const course = db.courses.find(c => c.id === courseId)
      if (!course) throw new RouteError(ERROR_CODES.INVALID_INPUT, '존재하지 않는 강의예요.', 400)
      if (course.currentEnrollment >= course.maxCapacity) {
        throw new RouteError(ERROR_CODES.COURSE_FULL, '정원이 초과된 강의예요.', 409)
      }
      if (db.enrollments.some(e => e.courseId === courseId && e.applicant.email === applicant.email)) {
        throw new RouteError(ERROR_CODES.DUPLICATE_ENROLLMENT, '이미 신청한 강의예요.', 409)
      }

      const newEnrollment: Enrollment = {
        id: crypto.randomUUID(),
        createdAt: now,
        enrollmentId,
        status: 'confirmed',
        enrolledAt: now,
        courseId,
        type,
        applicant,
        ...(group ? { group } : {}),
        agreedToTerms: true,
      }
      db.enrollments.push(newEnrollment)
      course.currentEnrollment += 1

      return newEnrollment
    })

    return NextResponse.json(
      { enrollmentId: enrollment.enrollmentId, status: enrollment.status, enrolledAt: enrollment.enrolledAt },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json(
        { code: error.code, message: error.message },
        { status: error.status }
      )
    }
    return NextResponse.json(
      { code: ERROR_CODES.SERVER_ERROR, message: '신청 처리 중 오류가 발생했어요.' },
      { status: 500 }
    )
  }
}
