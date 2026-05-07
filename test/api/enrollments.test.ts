import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/enrollments/route'

vi.mock('@/lib/db', () => ({
  transaction: vi.fn(),
}))

import { transaction } from '@/lib/db'
import type { DbSchema, Enrollment } from '@/lib/db'

const mockCourse = {
  id: 'c1',
  category: 'design',
  title: 'UX 라이팅 실전',
  instructor: '김유나',
  description: '실무 UX',
  maxCapacity: 20,
  currentEnrollment: 12,
  startDate: '2026-06-10T09:00:00+09:00',
  endDate: '2026-06-10T13:00:00+09:00',
  price: 89000,
  thumb: 'thumb-1',
  initial: 'UX',
}

function makeDb(
  courseOverrides?: Partial<typeof mockCourse>,
  enrollments: Enrollment[] = [],
): DbSchema {
  return {
    courses: [{ ...mockCourse, ...courseOverrides }],
    enrollments: [...enrollments],
  } as unknown as DbSchema
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const personalBody = {
  courseId: 'c1',
  type: 'personal',
  applicant: { name: '홍길동', email: 'hong@example.com', phone: '01012345678' },
  agreedToTerms: true,
}

const groupBody = {
  courseId: 'c1',
  type: 'group',
  applicant: { name: '이수진', email: 'sujin@example.com', phone: '01098765432' },
  group: {
    organizationName: '디자인팀',
    contactPerson: 'sujin@team.com',
    headCount: 3,
    participants: [
      { name: '이수진', email: 'sujin@team.com' },
      { name: '박재형', email: 'jaeh@team.com' },
      { name: '정승호', email: 'seungho@team.com' },
    ],
  },
  agreedToTerms: true,
}

let capturedDb: DbSchema

beforeEach(() => {
  capturedDb = makeDb()
  vi.mocked(transaction).mockImplementation(fn => fn(capturedDb))
})

describe('POST /api/enrollments', () => {
  it('개인 신청 성공 — 201 반환', async () => {
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.enrollmentId).toMatch(/^ENR-/)
    expect(json.status).toBe('confirmed')
  })

  it('단체 신청 성공 — 201 반환', async () => {
    const res = await POST(makeRequest(groupBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.enrollmentId).toMatch(/^ENR-/)
  })

  it('성공 후 currentEnrollment 증가', async () => {
    await POST(makeRequest(personalBody))
    expect((capturedDb.courses[0] as typeof mockCourse).currentEnrollment).toBe(13)
  })

  it('courseId 없으면 400 INVALID_INPUT', async () => {
    const res = await POST(makeRequest({ ...personalBody, courseId: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })

  it('존재하지 않는 강의 — 400', async () => {
    vi.mocked(transaction).mockImplementationOnce(fn =>
      fn({ courses: [], enrollments: [] } as unknown as DbSchema)
    )
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('존재하지 않는')
  })

  it('정원 초과 — 409 COURSE_FULL', async () => {
    vi.mocked(transaction).mockImplementationOnce(fn =>
      fn(makeDb({ currentEnrollment: 20 }))
    )
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.code).toBe('COURSE_FULL')
  })

  it('중복 신청 — 409 DUPLICATE_ENROLLMENT', async () => {
    const existing: Enrollment = {
      id: 'e1', enrollmentId: 'ENR-OLD', status: 'confirmed',
      enrolledAt: '', createdAt: '', courseId: 'c1', type: 'personal',
      applicant: { name: '홍길동', email: 'hong@example.com', phone: '01012345678' },
      agreedToTerms: true,
    }
    vi.mocked(transaction).mockImplementationOnce(fn =>
      fn(makeDb({}, [existing]))
    )
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.code).toBe('DUPLICATE_ENROLLMENT')
  })

  it('이름 1자 — step2 검증 실패 400', async () => {
    const res = await POST(makeRequest({ ...personalBody, applicant: { ...personalBody.applicant, name: '홍' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })

  it('잘못된 이메일 — step2 검증 실패 400', async () => {
    const res = await POST(makeRequest({ ...personalBody, applicant: { ...personalBody.applicant, email: 'not-an-email' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })

  it('전화번호 누락 — step2 검증 실패 400', async () => {
    const res = await POST(makeRequest({ ...personalBody, applicant: { name: '홍길동', email: 'hong@example.com' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })

  it('잘못된 전화번호 형식 — step2 검증 실패 400', async () => {
    const res = await POST(makeRequest({ ...personalBody, applicant: { ...personalBody.applicant, phone: '123-456' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })

  it('약관 미동의 — 400 INVALID_INPUT', async () => {
    const res = await POST(makeRequest({ ...personalBody, agreedToTerms: false }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
    expect(json.message).toContain('약관')
  })

  it('단체 신청 조직명 누락 — 400 INVALID_INPUT', async () => {
    const res = await POST(makeRequest({ ...groupBody, group: { ...groupBody.group, organizationName: '' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })
})
