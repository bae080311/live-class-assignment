import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/courses/route'

vi.mock('@/lib/db', () => ({
  getAll: vi.fn(),
}))

import { getAll } from '@/lib/db'

const mockCourses = [
  { id: 'c1', category: 'design', title: 'UX 라이팅 실전', instructor: '김유나' },
  { id: 'c2', category: 'development', title: 'React 깊이 있게', instructor: '이민서' },
  { id: 'c3', category: 'marketing', title: 'SQL 데이터 분석', instructor: '한지원' },
]

beforeEach(() => {
  vi.mocked(getAll).mockReturnValue(mockCourses as ReturnType<typeof getAll>)
})

function makeRequest(search = '') {
  return new Request(`http://localhost/api/courses${search}`)
}

describe('GET /api/courses', () => {
  it('전체 강의 목록과 카테고리 반환', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.courses).toHaveLength(3)
    expect(json.categories).toEqual(['development', 'design', 'marketing', 'business'])
  })

  it('design 카테고리 필터 적용', async () => {
    const res = await GET(makeRequest('?category=design'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.courses).toHaveLength(1)
    expect(json.courses[0].id).toBe('c1')
  })

  it('development 카테고리 필터 적용', async () => {
    const res = await GET(makeRequest('?category=development'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.courses).toHaveLength(1)
    expect(json.courses[0].id).toBe('c2')
  })

  it('잘못된 카테고리는 무시 — 전체 반환', async () => {
    const res = await GET(makeRequest('?category=unknown'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.courses).toHaveLength(3)
  })

  it('카테고리 파라미터 없으면 전체 반환', async () => {
    const res = await GET(makeRequest())
    const json = await res.json()
    expect(json.courses).toHaveLength(3)
  })
})
