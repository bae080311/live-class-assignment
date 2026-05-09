import { z } from 'zod'

export const CourseSchema = z.object({
  id: z.string(),
  category: z.enum(['development', 'design', 'marketing', 'business']),
  title: z.string(),
  instructor: z.string(),
  description: z.string(),
  maxCapacity: z.number(),
  currentEnrollment: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  price: z.number(),
})

export type Course = z.infer<typeof CourseSchema>

export const Step1Schema = z.object({
  courseId: z.string().min(1, '강의를 선택해주세요.'),
  type: z.enum(['personal', 'group']),
})

const ApplicantSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 해요.').max(20, '이름은 20자 이하로 입력해주세요.'),
  email: z.email({ error: '이메일 형식이 올바르지 않아요.' }),
  phone: z.preprocess(
    val => (typeof val === 'string' ? val.replace(/-/g, '') : val),
    z.string().regex(/^01[016789]\d{7,8}$/, '올바른 전화번호 형식이 아니에요. (예: 010-1234-5678)')
  ),
  motivation: z.string().max(300, '수강 동기는 300자 이하로 입력해주세요.').optional(),
})

export const Step2PersonalSchema = ApplicantSchema

export const Step2GroupSchema = ApplicantSchema.extend({
  organizationName: z.string().min(1, '단체명을 입력해주세요.'),
  headCount: z.number().int().min(2, '최소 2명 이상 신청해주세요.').max(10, '최대 10명까지 신청 가능해요.'),
  participants: z.array(
    z.object({
      name: z.string().min(1, '참가자 이름을 입력해주세요.'),
      email: z.email({ error: '올바른 이메일 형식이 아니에요.' }),
    })
  ),
  contactPerson: z.string().min(1, '담당자 연락처를 입력해주세요.'),
}).superRefine((data, ctx) => {
  if (data.participants && data.participants.length !== data.headCount) {
    ctx.addIssue({
      code: 'custom',
      message: '참가자 수가 신청 인원과 일치하지 않아요.',
      path: ['participants'],
    })
  }
})

export const Step3Schema = z.object({
  agreed: z.literal(true, { error: '약관 동의가 필요해요.' }),
})

export type EnrollmentFormData = {
  courseId: string
  type: 'personal' | 'group'
  name: string
  email: string
  phone: string
  motivation?: string
  organizationName?: string
  headCount?: number
  participants?: { name: string; email: string }[]
  contactPerson?: string
  agreed?: boolean
}

export type RHFData = Required<EnrollmentFormData>

export type EnrollmentResult = {
  enrollmentId: string
  status: 'confirmed' | 'pending'
  enrolledAt: string
}

export type SaveState = 'saved' | 'saving' | 'fail'

export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  COURSE_FULL: 'COURSE_FULL',
  DUPLICATE_ENROLLMENT: 'DUPLICATE_ENROLLMENT',
  SERVER_ERROR: 'SERVER_ERROR',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

export type ErrorResponse = {
  code: ErrorCode
  message: string
  details?: Record<string, string>
}

export function validateStep1(data: Partial<EnrollmentFormData>) {
  return Step1Schema.safeParse(data)
}

export function validateStep2Personal(data: Partial<EnrollmentFormData>) {
  return Step2PersonalSchema.safeParse(data)
}

export function validateStep2Group(data: Partial<EnrollmentFormData>) {
  return Step2GroupSchema.safeParse(data)
}

export function validateStep3(data: Partial<EnrollmentFormData>) {
  return Step3Schema.safeParse(data)
}
