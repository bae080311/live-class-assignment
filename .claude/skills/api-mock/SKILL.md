# 스킬: API Mock

## 범위
Mock API 라우트 핸들러 및 파일 기반 데이터베이스 패턴.

## 언제 로드할까
- API 라우트 추가/수정
- mock 데이터베이스 로직 변경
- 새 엔드포인트 구현
- API 에러 응답 수정

## 핵심 패턴

### 1. 라우트 핸들러 구조

```typescript
// app/api/{resource}/route.ts
import { NextResponse } from 'next/server'
import { getAll, create } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // 1. 쿼리 파라미터 추출
    // 2. DB 에서 조회
    // 3. 필터 적용
    // 4. JSON 응답 반환
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: '한국어 에러 메시지' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // 1. Zod 스키마로 검증
    // 2. 비즈니스 로직 체크 (정원, 중복)
    // 3. DB 에 저장
    // 4. 성공 응답 반환
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json(
      { code: 'INVALID_INPUT', message: '한국어 에러' },
      { status: 500 }
    )
  }
}
```

### 2. 파일 기반 DB (lib/db.ts)

`data/db.json` 파일을 Node.js `fs` 모듈로 읽고 쓰는 서버 전용 모듈.

```typescript
import 'server-only'
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

function readDb(): DbSchema {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
}

function writeDb(data: DbSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function getAll<K extends keyof DbSchema>(entity: K): DbSchema[K] {
  return readDb()[entity]
}

export function create<K extends keyof DbSchema>(
  entity: K,
  item: Omit<DbSchema[K][number], 'id' | 'createdAt'>
): DbSchema[K][number] {
  const db = readDb()
  const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  ;(db[entity] as Array<DbSchema[K][number]>).push(newItem as DbSchema[K][number])
  writeDb(db)
  return newItem as DbSchema[K][number]
}

// getById: 단건 조회 (없으면 undefined)
export function getById<K extends keyof DbSchema>(entity: K, id: string): DbSchema[K][number] | undefined

// remove: 삭제 후 성공 여부 반환 (없으면 false)
export function remove<K extends keyof DbSchema>(entity: K, id: string): boolean
```

**중요**: `server-only` 가드 — 클라이언트 임포트 방지.

### 3. 에러 응답 형식

모든 에러는 이 형태:
```typescript
{
  code: 'COURSE_FULL' | 'DUPLICATE_ENROLLMENT' | 'INVALID_INPUT',
  message: string,      // 한국어 사용자 메시지
  details?: Record<string, string>  // 필드별 에러
}
```

### 4. HTTP 상태 코드

| 시나리오 | 상태 | 코드 |
|---|---|---|
| 검증 에러 | 400 | `INVALID_INPUT` |
| 정원 초과 | 409 | `COURSE_FULL` |
| 중복 신청 | 409 | `DUPLICATE_ENROLLMENT` |
| 서버 에러 | 500 | — |
| 성공 (생성) | 201 | — |

### 5. 서버 측 검증 체인

```typescript
// 1. Step 1 검증 (courseId, type)
const step1 = Step1Schema.safeParse(body)
if (!step1.success) → 400 INVALID_INPUT

// 2. 강의 존재 확인
const course = courses.find(c => c.id === step1.data.courseId)
if (!course) → 400 INVALID_INPUT

// 3. 정원 확인
if (course.currentEnrollment >= course.maxCapacity) → 409 COURSE_FULL

// 4. 중복 확인 (email은 applicant 객체 안에 중첩됨)
if (enrollments.some(e => e.courseId === courseId && e.applicant.email === email))
  → 409 DUPLICATE_ENROLLMENT

// 5. Step 2 검증 (개인 또는 단체 스키마)
const step2 = step2Schema.safeParse(body)
if (!step2.success) → 400 INVALID_INPUT

// 6. Step 3 검증 (약관 동의)
const agreed = Step3Schema.safeParse({ agreed: body.agreed ?? body.agreedToTerms })
if (!agreed.success) → 400 INVALID_INPUT
```

### 6. 클라이언트 API 래퍼

```typescript
// lib/api/{resource}.ts
import { apiClient } from './client'

export async function fetchSomething(): Promise<ResponseType> {
  return apiClient.get('/api/something').json<ResponseType>()
}
```

**규칙:**
- `apiClient` (`lib/api/client.ts`) 전용 — `import ky from 'ky'` 직접 사용 금지
- `json` 옵션으로 자동 JSON 직렬화
- 타입 명시된 결과 반환
- raw `useEffect` 말고 TanStack React Query 와 함께 사용

### 안티패턴

| 패턴 | 왜 나쁜가 | 해결 |
|---|---|---|
| 서버 검증 건너뜀 | 클라이언트 검증 우회 가능 | 항상 서버 재검증 |
| 영어 에러 메시지 | 사용자 facing 은 한국어 | 한국어 전용 |
| `server-only` 임포트 누락 | 클라이언트가 서버 코드 임포트 가능 | `import 'server-only'` 추가 |
| raw `fetch()` 또는 `import ky` 직접 사용 | 공유 인스턴스 설정 무시됨 | `apiClient` 사용 |
| `JSON.stringify(body)` | 불필요한 보일러플레이트 | `apiClient` `json` 옵션 사용 |
