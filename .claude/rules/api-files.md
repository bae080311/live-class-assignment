# 규칙 대상: app/api/*/route.ts

## ANY API 라우트 핸들러 편집 시

### 필수 사항
1. 서버 전용 모듈 상단에 `'server-only'` 임포트
2. `try/catch` 로 감싸기 — 예상치 못한 에러 시 500 반환
3. 모든 입력을 Zod 스키마로 재검증 (클라이언트 신뢰 금지)
4. `safeParse()` 사용 — `parse()` 금지
5. 에러 반환 형식: `{ code, message, details? }`
6. 올바른 HTTP 상태 코드: 201 (성공), 400 (검증), 409 (충돌), 500 (서버)
7. 에러 메시지 한국어

### 라우트 핸들러 템플릿
```typescript
import { NextResponse } from 'next/server'
import { getAll, getById, create, remove } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // 로직
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
    // 1. Zod 검증
    // 2. 비즈니스 로직 (정원, 중복)
    // 3. DB 저장
    return NextResponse.json(result, { status: 201 })
  } catch {
    return NextResponse.json(
      { code: 'INVALID_INPUT', message: '한국어 에러' },
      { status: 500 }
    )
  }
}
```

### 비즈니스 로직 체크 (POST)
1. **강의 존재 확인** → 400 `INVALID_INPUT`
2. **정원 확인** → 409 `COURSE_FULL`
3. **중복 신청 확인** → 409 `DUPLICATE_ENROLLMENT`
4. **Step 1 검증** → 400 `INVALID_INPUT`
5. **Step 2 검증** → 400 `INVALID_INPUT`
6. **약관 동의 확인** → 400 `INVALID_INPUT`

### 안티패턴
- ❌ 서버 측 검증 건너뜀
- ❌ 영어 에러 메시지
- ❌ `try/catch` 누락
- ❌ 잘못된 HTTP 상태 코드
- ❌ 직접 DB 조작 (`getAll`, `getById`, `create`, `remove` 사용)
- ❌ 에러 처리 없이 `fetch()`
