# 규칙 대상: lib/api/*.ts

## ANY 클라이언트 API 래퍼 편집 시

### 필수 사항
1. 타입 명시된 async 함수로 export
2. `HTTPError` 캐치로 사용자 정의 에러 메시지 처리
3. TanStack React Query 와 함께 사용 — raw `useEffect` 금지

### 공유 클라이언트 인스턴스 (`lib/api/client.ts`)
```typescript
// ⚠️ ky 직접 임포트는 오직 이 파일에서만 허용
import ky from 'ky'

export const apiClient = ky.create({
  retry: 0,
  timeout: 10000,
})
```
`lib/api/client.ts` 만 `ky`를 직접 임포트한다. 다른 모든 래퍼는 `apiClient`를 사용한다.

### GET 래퍼 템플릿
```typescript
import { apiClient } from './client'
import type { ResponseType } from '@/lib/schemas/enrollment'

export async function fetchResource(param?: string): Promise<ResponseType> {
  const searchParams = param ? { q: param } : undefined
  return apiClient.get('/api/resource', { searchParams }).json<ResponseType>()
}
```

### POST 래퍼 템플릿
```typescript
import { HTTPError } from 'ky'
import { apiClient } from './client'

export async function createResource(data: RequestType): Promise<ResponseType> {
  try {
    return apiClient.post('/api/resource', { json: data }).json<ResponseType>()
  } catch (error) {
    if (error instanceof HTTPError) {
      const err = await error.response.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message ?? '기본 한국어 메시지')
    }
    throw new Error('기본 한국어 메시지')
  }
}
```

### React Query 와 함께 사용
```typescript
const { data } = useQuery({
  queryKey: ['resource', param],
  queryFn: () => fetchResource(param),
})

const mutation = useMutation({
  mutationFn: (data: RequestType) => createResource(data),
  onSuccess: (result) => { /* 처리 */ },
  onError: () => { /* 처리 */ },
})
```

### 안티패턴
- ❌ `res.ok` 수동 체크 (`ky` 가 자동 처리)
- ❌ `JSON.stringify(body)` (ky 의 `json` 옵션 사용)
- ❌ `throw new Error(...)` 에 영어 메시지
- ❌ 데이터 패칭에 `useEffect` 사용 (React Query 사용)
- ❌ `as any` 타입 캐스팅
