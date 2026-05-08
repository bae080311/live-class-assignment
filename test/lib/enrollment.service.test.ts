import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('server-only', () => ({}))

const mockCourse = {
  id: 'c1',
  category: 'design',
  title: 'UX 라이팅 실전',
  instructor: '김유나',
  description: '실무에서 바로 쓰는 UX 라이팅 원칙과 사례',
  maxCapacity: 20,
  currentEnrollment: 5,
  startDate: '2026-06-10T09:00:00+09:00',
  endDate: '2026-06-10T13:00:00+09:00',
  price: 89000,
}

const mockDb = {
  courses: [{ ...mockCourse }],
  enrollments: [] as unknown[],
}

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(() => JSON.stringify(mockDb)),
    writeFileSync: vi.fn((path: string, data: string) => {
      const parsed = JSON.parse(data)
      mockDb.courses = parsed.courses
      mockDb.enrollments = parsed.enrollments
    }),
  },
  readFileSync: vi.fn(() => JSON.stringify(mockDb)),
  writeFileSync: vi.fn((path: string, data: string) => {
    const parsed = JSON.parse(data)
    mockDb.courses = parsed.courses
    mockDb.enrollments = parsed.enrollments
  }),
}))

vi.mock('path', () => ({
  default: { join: (...args: string[]) => args.join('/') },
  join: (...args: string[]) => args.join('/'),
}))

import { createEnrollment, ServiceError } from '@/lib/services/enrollment'

const validPersonalBody = {
  courseId: 'c1',
  type: 'personal',
  applicant: {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '01012345678',
  },
  agreedToTerms: true,
}

const validGroupBody = {
  courseId: 'c1',
  type: 'group',
  applicant: {
    name: '김담당',
    email: 'kim@example.com',
    phone: '01098765432',
  },
  group: {
    organizationName: '디자인팀',
    headCount: 2,
    participants: [
      { name: '참가자1', email: 'p1@example.com' },
      { name: '참가자2', email: 'p2@example.com' },
    ],
    contactPerson: 'kim@example.com',
  },
  agreedToTerms: true,
}

describe('createEnrollment', () => {
  beforeEach(() => {
    mockDb.courses = [{ ...mockCourse }]
    mockDb.enrollments = []
  })

  it('개인 신청을 성공적으로 생성한다', () => {
    const result = createEnrollment(validPersonalBody)
    expect(result.enrollmentId).toMatch(/^ENR-/)
    expect(result.status).toBe('confirmed')
    expect(result.enrolledAt).toBeTruthy()
  })

  it('단체 신청을 성공적으로 생성한다', () => {
    const result = createEnrollment(validGroupBody)
    expect(result.enrollmentId).toMatch(/^ENR-/)
    expect(result.status).toBe('confirmed')
  })

  it('강의 정원이 초과되면 COURSE_FULL 에러를 반환한다', () => {
    mockDb.courses = [{ ...mockCourse, currentEnrollment: 20 }]
    expect(() => createEnrollment(validPersonalBody)).toThrow(ServiceError)
    try {
      createEnrollment(validPersonalBody)
    } catch (e) {
      expect((e as ServiceError).code).toBe('COURSE_FULL')
      expect((e as ServiceError).status).toBe(409)
    }
  })

  it('중복 신청 시 DUPLICATE_ENROLLMENT 에러를 반환한다', () => {
    createEnrollment(validPersonalBody)
    expect(() => createEnrollment(validPersonalBody)).toThrow(ServiceError)
    try {
      createEnrollment(validPersonalBody)
    } catch (e) {
      expect((e as ServiceError).code).toBe('DUPLICATE_ENROLLMENT')
      expect((e as ServiceError).status).toBe(409)
    }
  })

  it('존재하지 않는 강의 신청 시 INVALID_INPUT 에러를 반환한다', () => {
    expect(() => createEnrollment({ ...validPersonalBody, courseId: 'not-exist' })).toThrow(ServiceError)
    try {
      createEnrollment({ ...validPersonalBody, courseId: 'not-exist' })
    } catch (e) {
      expect((e as ServiceError).code).toBe('INVALID_INPUT')
      expect((e as ServiceError).status).toBe(400)
    }
  })

  it('courseId 누락 시 INVALID_INPUT 에러를 반환한다', () => {
    expect(() => createEnrollment({ ...validPersonalBody, courseId: undefined })).toThrow(ServiceError)
  })

  it('약관 미동의 시 INVALID_INPUT 에러를 반환한다', () => {
    expect(() => createEnrollment({ ...validPersonalBody, agreedToTerms: false })).toThrow(ServiceError)
    try {
      createEnrollment({ ...validPersonalBody, agreedToTerms: false })
    } catch (e) {
      expect((e as ServiceError).code).toBe('INVALID_INPUT')
    }
  })

  it('신청자 이름 누락 시 INVALID_INPUT 에러를 반환한다', () => {
    expect(() =>
      createEnrollment({ ...validPersonalBody, applicant: { ...validPersonalBody.applicant, name: '' } })
    ).toThrow(ServiceError)
  })

  it('잘못된 이메일 형식 시 INVALID_INPUT 에러를 반환한다', () => {
    expect(() =>
      createEnrollment({ ...validPersonalBody, applicant: { ...validPersonalBody.applicant, email: 'not-email' } })
    ).toThrow(ServiceError)
  })

  it('단체 신청 시 참가자 수가 headCount와 다르면 에러를 반환한다', () => {
    expect(() =>
      createEnrollment({
        ...validGroupBody,
        group: { ...validGroupBody.group, headCount: 3 },
      })
    ).toThrow(ServiceError)
  })
})
