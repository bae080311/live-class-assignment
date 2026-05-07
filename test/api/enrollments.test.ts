import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/enrollments/route'

vi.mock('@/lib/db', () => ({
  getById: vi.fn(),
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}))

import { getById, getAll, create, update } from '@/lib/db'

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

const createdEnrollment = {
  enrollmentId: 'ENR-TEST',
  status: 'confirmed' as const,
  enrolledAt: '2026-05-06T00:00:00.000Z',
  courseId: 'c1',
  type: 'personal' as const,
  applicant: { name: '홍길동', email: 'hong@example.com', phone: '01012345678' },
  agreedToTerms: true,
}

function makeRequest(body: object) {
  return new Request('http://localhost/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// 명세 기준 nested 구조
const personalBody = {
  courseId: 'c1',
  type: 'personal',
  applicant: {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '01012345678',
  },
  agreedToTerms: true,
}

const groupBody = {
  courseId: 'c1',
  type: 'group',
  applicant: {
    name: '이수진',
    email: 'sujin@example.com',
    phone: '01098765432',
  },
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

beforeEach(() => {
  vi.mocked(getById).mockReturnValue(mockCourse as ReturnType<typeof getById>)
  vi.mocked(getAll).mockReturnValue([] as ReturnType<typeof getAll>)
  vi.mocked(create).mockReturnValue(createdEnrollment as ReturnType<typeof create>)
  vi.mocked(update).mockReturnValue(undefined as unknown as ReturnType<typeof update>)
})

describe('POST /api/enrollments', () => {
  it('개인 신청 성공 — 201 반환', async () => {
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.enrollmentId).toBe('ENR-TEST')
    expect(json.status).toBe('confirmed')
  })

  it('단체 신청 성공 — 201 반환', async () => {
    vi.mocked(create).mockReturnValueOnce({
      ...createdEnrollment,
      enrollmentId: 'ENR-GROUP',
      type: 'group',
    } as ReturnType<typeof create>)

    const res = await POST(makeRequest(groupBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.enrollmentId).toBe('ENR-GROUP')
  })

  it('성공 후 currentEnrollment 증가 — update 호출됨', async () => {
    await POST(makeRequest(personalBody))
    expect(vi.mocked(update)).toHaveBeenCalledWith('courses', 'c1', {
      currentEnrollment: 13,
    })
  })

  it('courseId 없으면 400 INVALID_INPUT', async () => {
    const res = await POST(makeRequest({ ...personalBody, courseId: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })

  it('존재하지 않는 강의 — 400', async () => {
    vi.mocked(getById).mockReturnValueOnce(null as unknown as ReturnType<typeof getById>)
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.message).toContain('존재하지 않는')
  })

  it('정원 초과 — 409 COURSE_FULL', async () => {
    vi.mocked(getById).mockReturnValueOnce({
      ...mockCourse,
      currentEnrollment: 20,
    } as ReturnType<typeof getById>)
    const res = await POST(makeRequest(personalBody))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.code).toBe('COURSE_FULL')
  })

  it('중복 신청 — 409 DUPLICATE_ENROLLMENT', async () => {
    vi.mocked(getAll).mockReturnValueOnce([
      { courseId: 'c1', applicant: { email: 'hong@example.com' } },
    ] as ReturnType<typeof getAll>)
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
    const res = await POST(makeRequest({
      ...groupBody,
      group: { ...groupBody.group, organizationName: '' },
    }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('INVALID_INPUT')
  })
})
