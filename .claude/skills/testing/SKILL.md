# 스킬: 테스트

## 범위
이 프로젝트의 Vitest + Testing Library 테스트 패턴.

## 언제 로드할까
- 새 테스트 작성
- 실패하는 테스트 수정
- 테스트 커버리지 추가
- 테스트 파일 리팩터링

## 핵심 패턴

### 1. 테스트 파일 구조

```
test/
├── components/
│   ├── EnrollmentForm.test.tsx    # 통합 테스트
│   ├── Step1CourseSelect.test.tsx # 컴포넌트 테스트
│   ├── Step2StudentInfo.test.tsx
│   └── Step3Confirm.test.tsx
├── lib/
│   ├── courses.test.ts            # API 래퍼 테스트
│   └── enrollments.test.ts
└── schemas/
    └── enrollment.test.ts         # Zod 검증 테스트
```

### 2. 컴포넌트 테스트 패턴

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Component } from '@/components/...'

// fetch/API 호출 모킹
vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn(() => Promise.resolve({
    courses: [...mockCourses],
    categories: ['development', 'design'],
  })),
}))

describe('컴포넌트명', () => {
  it('올바르게 렌더링된다', () => {
    render(<Component {...props} />)
    expect(screen.getByRole('heading', { name: /제목/i })).toBeInTheDocument()
  })

  it('사용자 상호작용을 처리한다', async () => {
    const user = userEvent.setup()
    render(<Component {...props} />)
    await user.click(screen.getByRole('button', { name: /다음/i }))
    expect(onNext).toHaveBeenCalled()
  })

  it('검증 에러를 표시한다', async () => {
    const user = userEvent.setup()
    render(<Component {...props} />)
    await user.click(screen.getByRole('button', { name: /제출/i }))
    expect(screen.getByText(/에러 메시지/i)).toBeInTheDocument()
  })
})
```

### 3. 스키마 테스트 패턴

```typescript
import { describe, it, expect } from 'vitest'
import { Step1Schema, Step2PersonalSchema, Step2GroupSchema } from '@/lib/schemas/enrollment'

describe('Step1Schema', () => {
  it('유효한 데이터를 받는다', () => {
    const result = Step1Schema.safeParse({
      courseId: 'course-1',
      type: 'personal',
    })
    expect(result.success).toBe(true)
  })

  it('빈 courseId 를 거부한다', () => {
    const result = Step1Schema.safeParse({
      courseId: '',
      type: 'personal',
    })
    expect(result.success).toBe(false)
  })

  it('잘못된 type 을 거부한다', () => {
    const result = Step1Schema.safeParse({
      courseId: 'course-1',
      type: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})
```

### 4. API 래퍼 테스트 패턴

컴포넌트 테스트에서는 API 래퍼 모듈 자체를 통째로 모킹 (권장):

```typescript
// 컴포넌트 테스트에서 사용하는 패턴
vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn().mockResolvedValue({ courses: [], categories: [] }),
}))
```

래퍼 자체를 단위 테스트할 때는 `apiClient` 모킹:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCourses } from '@/lib/api/courses'

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn().mockReturnValue({
      json: () => Promise.resolve({ courses: [], categories: [] }),
    }),
  },
}))

describe('fetchCourses', () => {
  beforeEach(() => vi.clearAllMocks())

  it('성공 시 courses 를 반환한다', async () => {
    const result = await fetchCourses()
    expect(result.courses).toEqual([])
  })

  it('에러 시 throw 한다', async () => {
    const { apiClient } = await import('@/lib/api/client')
    vi.mocked(apiClient.get).mockReturnValueOnce({
      json: () => Promise.reject(new Error('강의 목록을 불러올 수 없어요.')),
    } as ReturnType<typeof apiClient.get>)

    await expect(fetchCourses()).rejects.toThrow()
  })
})
```

### 5. 사용자 흐름 테스트 (구현 세부사항 아님)

```typescript
// GOOD: 사용자 행동 테스트
it('수강 신청 흐름을 완료한다', async () => {
  const user = userEvent.setup()
  render(<EnrollmentForm />)

  // Step 1: 강의 선택
  await user.click(screen.getByText('React 마스터클래스'))
  await user.click(screen.getByRole('button', { name: '다음' }))

  // Step 2: 개인 정보 입력
  await user.type(screen.getByLabelText('이름'), '홍길동')
  await user.type(screen.getByLabelText('이메일'), 'test@example.com')
  await user.type(screen.getByLabelText('전화번호'), '010-1234-5678')
  await user.click(screen.getByRole('button', { name: '다음' }))

  // Step 3: 확인 및 제출
  expect(screen.getByText('홍길동')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '신청 제출하기' }))

  // 성공
  expect(screen.getByText(/신청 완료/i)).toBeInTheDocument()
})
```

### 6. Mock 데이터 패턴

```typescript
// test/fixtures.ts
export const mockCourses = [
  {
    id: 'course-1',
    title: 'React 마스터클래스',
    category: 'development',
    price: 99000,
    maxCapacity: 30,
    currentEnrollment: 15,
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-03-15T00:00:00Z',
    instructor: '김강사',
  },
]

export const validPersonalData = {
  courseId: 'course-1',
  type: 'personal' as const,
  name: '홍길동',
  email: 'test@example.com',
  phone: '010-1234-5678',
  motivation: '배우고 싶어요',
  agreed: true,
}
```

### 테스트 규칙

1. **구현이 아닌 행동 테스트** — 상태가 아닌 사용자 상호작용
2. **모든 API 호출 모킹** — 실제 엔드포인트 호출 금지
3. **유효 + 무효 입력 둘 다 테스트** — 특히 Zod 스키마
4. **커버리지 목표: 80%+** — `npm run test:coverage` 실행
5. **`@testing-library/jest-dom` 매처 사용** (setup.ts 통해)
6. **비동기 상호작용에 `userEvent.setup()`**

### 안티패턴

| 패턴 | 왜 나쁜가 | 해결 |
|---|---|---|
| 내부 상태 테스트 | 깨지기 쉬움, 리팩터링 시 파괴 | 렌더링 결과 테스트 |
| 모킹 설정 건너뜀 | 실제 API 호출, flaky | 모든 fetch 모킹 |
| happy path 만 테스트 | 엣지 케이스 놓침 | 무효 입력도 테스트 |
| 테스트에서 `as any` | 타입 에러 숨김 | 적절한 타입 또는 `vi.mocked()` |
| 실패 테스트 삭제 | 실제 버그 숨김 | 버그 수정, 테스트 유지 |
