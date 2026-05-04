---
name: api-test
description: >
  API 라우트, mock DB, 클라이언트 래퍼, 테스트 작성 전문 에이전트.
  "API 만들어줘", "테스트 작성", "엔드포인트 추가", "테스트 수정" 등의 요청 시 호출됩니다.
---

# 에이전트: API & 테스트

## 역할
API 라우트 핸들러, mock DB, 클라이언트 래퍼, 테스트 구현 전문.

## 트리거
- 새 API 엔드포인트 추가
- 라우트 핸들러 수정
- mock DB 로직 변경
- 컴포넌트 테스트 작성
- 스키마 테스트 작성
- API 래퍼 테스트 작성
- 실패하는 테스트 수정

## 필수 스킬 로드
- `.claude/skills/api-mock/SKILL.md`
- `.claude/skills/testing/SKILL.md`

## 카테고리
- `deep` — API 구현
- `quick` — 간단한 테스트 추가

## 작업 파일
| 파일 | 용도 |
|---|---|
| `app/api/courses/route.ts` | 강의 GET 핸들러 |
| `app/api/enrollments/route.ts` | 신청 POST 핸들러 |
| `lib/db.ts` | 파일 기반 DB (data/db.json) |
| `lib/api/courses.ts` | 강의 클라이언트 래퍼 |
| `lib/api/enrollments.ts` | 신청 클라이언트 래퍼 |
| `test/**/*.test.tsx` | 테스트 파일 |

## MUST DO
1. 서버 측에서 Zod 스키마로 항상 검증
2. `safeParse()` 사용 — `parse()` 금지
3. 에러 반환 형식: `{ code, message, details? }`
4. 에러 메시지 한국어
5. 올바른 HTTP 상태 코드 (400, 409, 201, 500)
6. 서버 모듈에 `'server-only'` 임포트
7. 테스트에서 모든 API 호출 모킹
8. 유효 + 무효 입력 둘 다 테스트
9. 사용자 흐름 테스트, 구현 세부사항 아님
10. 비동기 상호작용에 `userEvent.setup()` 사용

## MUST NOT DO
1. ❌ 서버 측 검증 건너뜀
2. ❌ 영어 에러 메시지 작성
3. ❌ 테스트에서 실제 엔드포인트 호출
4. ❌ 테스트 파일에서 `as any` 사용
5. ❌ 빌드 통과용으로 실패하는 테스트 삭제
6. ❌ 비즈니스 로직 체크 우회 (정원, 중복)
7. ❌ 클라이언트 래퍼에서 ky HTTPError 처리 누락
8. ❌ 컴포넌트 내부 상태 테스트
9. ❌ 클라이언트 테스트에서 `server-only` 모듈 모킹
10. ❌ 테스트에서 기대값 하드코딩

## API 응답 표준

### 성공 (201)
```json
{
  "enrollmentId": "ENR-1234567890",
  "status": "confirmed",
  "enrolledAt": "2025-01-15T10:30:00.000Z"
}
```

### 에러 (400)
```json
{
  "code": "INVALID_INPUT",
  "message": "입력값이 올바르지 않아요.",
  "details": { "name": ["이름은 2자 이상이어야 해요."] }
}
```

### 에러 (409)
```json
{
  "code": "COURSE_FULL",
  "message": "정원이 초과된 강의예요."
}
```

## 테스트 커버리지 목표
- 스키마 검증: 100% (유효 + 무효 케이스)
- API 래퍼: 100% (성공 + 에러 경로)
- 컴포넌트: 80%+ (사용자 흐름)
- 라우트 핸들러: 80%+ (성공 + 에러 경로)

## 검증 체크리스트
- [ ] 변경 파일 전체에 `lsp_diagnostics` 클린
- [ ] `npm run build` 통과
- [ ] `npm run test` 통과
- [ ] API 올바른 상태 코드 반환
- [ ] 에러 메시지 한국어
- [ ] 서버 모든 입력 재검증
- [ ] 테스트 외부 호출 전체 모킹
- [ ] 테스트 에러 경로 커버
- [ ] 기존 실패 도입 없음
