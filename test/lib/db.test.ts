import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock server-only before importing db
vi.mock('server-only', () => ({}))

// Mock fs module
const mockDb = {
  courses: [
    {
      id: 'c1',
      category: 'design',
      title: 'UX 라이팅 실전',
      instructor: '김유나',
      description: '실무에서 바로 쓰는 UX 라이팅 원칙과 사례',
      maxCapacity: 20,
      currentEnrollment: 12,
      startDate: '2026-06-10T09:00:00+09:00',
      endDate: '2026-06-10T13:00:00+09:00',
      price: 89000,
    },
  ],
  enrollments: [] as Array<{ id: string; createdAt: string; enrollmentId: string }>,
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
  default: {
    join: (...args: string[]) => args.join('/'),
  },
  join: (...args: string[]) => args.join('/'),
}))

import { getAll, getById, create, remove } from '@/lib/db'

beforeEach(() => {
  mockDb.enrollments = []
})

describe('getAll', () => {
  it('courses 전체 반환', () => {
    const courses = getAll('courses')
    expect(courses).toHaveLength(1)
    expect(courses[0].id).toBe('c1')
  })

  it('enrollments 빈 배열 반환', () => {
    const enrollments = getAll('enrollments')
    expect(enrollments).toHaveLength(0)
  })
})

describe('getById', () => {
  it('존재하는 id 반환', () => {
    const course = getById('courses', 'c1')
    expect(course).toBeDefined()
    expect(course?.title).toBe('UX 라이팅 실전')
  })

  it('없는 id는 undefined 반환', () => {
    const course = getById('courses', 'not-exist')
    expect(course).toBeUndefined()
  })
})

describe('create', () => {
  it('UUID와 createdAt 포함하여 저장', () => {
    const enrollment = create('enrollments', {
      enrollmentId: 'ENR-123456',
      status: 'confirmed' as const,
      enrolledAt: new Date().toISOString(),
      courseId: 'c1',
      type: 'personal' as const,
      applicant: {
        name: '홍길동',
        email: 'hong@example.com',
        phone: '01012345678',
      },
      agreedToTerms: true,
    })

    expect(enrollment.id).toBeDefined()
    expect(enrollment.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
    expect(enrollment.createdAt).toBeDefined()
    expect(new Date(enrollment.createdAt).toISOString()).toBe(enrollment.createdAt)
  })

  it('생성 후 getAll로 조회 가능', () => {
    create('enrollments', {
      enrollmentId: 'ENR-111111',
      status: 'confirmed' as const,
      enrolledAt: new Date().toISOString(),
      courseId: 'c1',
      type: 'personal' as const,
      applicant: {
        name: '김철수',
        email: 'kim@example.com',
        phone: '01098765432',
      },
      agreedToTerms: true,
    })
    expect(getAll('enrollments')).toHaveLength(1)
  })
})

describe('remove', () => {
  it('존재하는 항목 삭제 후 true 반환', () => {
    const enrollment = create('enrollments', {
      enrollmentId: 'ENR-999999',
      status: 'confirmed' as const,
      enrolledAt: new Date().toISOString(),
      courseId: 'c1',
      type: 'personal' as const,
      applicant: {
        name: '테스트',
        email: 'test@test.com',
        phone: '01011112222',
      },
      agreedToTerms: true,
    })
    const result = remove('enrollments', enrollment.id)
    expect(result).toBe(true)
    expect(getAll('enrollments')).toHaveLength(0)
  })

  it('없는 id는 false 반환', () => {
    const result = remove('enrollments', 'non-existent-id')
    expect(result).toBe(false)
  })
})
