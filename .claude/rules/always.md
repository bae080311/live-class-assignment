# 핵심 규칙 — live-class-assignment

이 규칙은 항상 적용됨. 모든 세션에서 자동 로드.

## 1. 기술 스택 (절대 변경 금지)

| 계층 | 기술 | 금지 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) | Pages Router |
| 언어 | TypeScript (strict) |
| 폼 | react-hook-form 7.x |
| 검증 | Zod 4.x |
| 데이터 패칭 | ky + TanStack React Query 5.x |
| 스타일링 | Tailwind CSS v3 | styled-components, MUI, 인라인 스타일 |
| 테스트 | Vitest + Testing Library |

## 2. 하드 제약

- **`as any` 금지** — 어떤 경우에도
- **`@ts-ignore` / `@ts-expect-error` 금지** — 어떤 경우에도
- **`as unknown as`** — 정말 필요할 때만 (이유 주석 필수)
- **외부 UI 라이브러리 금지** — 예외 없음
- **인라인 스타일 금지** — Tailwind 유틸리티 클래스 사용
- **폼 상태에 Context API 금지** — orchestrator 패턴 전용
- **테스트 삭제 금지** — 빌드 통과용으로

## 3. 파일 컨벤션

- 컴포넌트: `components/enrollment/` 에 `PascalCase.tsx`
- API 라우트: `app/api/{resource}/route.ts`
- 클라이언트 래퍼: `lib/api/{resource}.ts`
- 스키마: `lib/schemas/{domain}.ts`
- 테스트: `test/{category}/{name}.test.tsx`
- 상호작용 컴포넌트: 파일 상단에 `'use client'` 지시문

## 4. 에러 응답 포맷

모든 API 에러는 아래 형식 필수:
```typescript
{ code: string; message: string; details?: Record<string, string> }
```
에러 코드: `COURSE_FULL`, `DUPLICATE_ENROLLMENT`, `INVALID_INPUT`

## 5. 검증 파이프라인

- 클라이언트: 스텝 전환 전에 `safeParse()` 실행
- 서버: 라우트 핸들러에서 동일 Zod 스키마로 재검증
- 클라이언트 검증만 믿지 말 것

## 6. 태스크 완료 전 체크

1. 변경 파일에 `lsp_diagnostics` 클린
2. `npm run build` 통과
3. `npm run test` 통과 (새 실패 없음)
4. 에러 메시지 한국어 확인
5. 새 인라인 스타일 없음 (Tailwind 클래스 사용)
6. `as any` 나 `@ts-ignore` 없음
