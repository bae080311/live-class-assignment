# 프로젝트 설정 — live-class-assignment

다단계 수강 신청 폼 (Next.js 16 + React 19 + TypeScript).

## 디렉토리 구조

```
.claude/
├── README.md              ← 너는 여기 (색인)
├── context.md             ← 아키텍처, 데이터 흐름, 타입, 토큰
├── rules/                 ← Claude Code 가 파일 패턴마다 자동 로드
│   ├── always.md          ← 모든 세션: 기술 스택, 하드 제약
│   ├── component-files.md ← components/enrollment/*.tsx
│   ├── schema-files.md    ← lib/schemas/*.ts
│   ├── api-files.md       ← app/api/*/route.ts
│   ├── client-api-files.md← lib/api/*.ts
│   ├── test-files.md      ← test/**/*.test.tsx
│   └── css-files.md       ← app/globals.css
├── skills/                ← 복잡한 태스크 시 명시적 로드 (서브디렉토리/SKILL.md)
│   ├── form-patterns/SKILL.md  ← react-hook-form + Zod 다단계 패턴
│   ├── api-mock/SKILL.md       ← 파일 기반 DB + API 패턴
│   └── testing/SKILL.md        ← Vitest + Testing Library 패턴
├── agents/                ← 태스크 위임 스펙 (YAML frontmatter 포함)
│   ├── form-builder.md    ← 폼 컴포넌트 전문
│   └── api-test.md        ← API + 테스트 전문
├── hooks/                 ← 실행 가능한 bash 스크립트
│   └── postToolUse.sh     ← TS/CSS 편집 후 prettier 자동 실행
└── settings.json          ← 훅 등록 (PostToolUse)
```

## 규칙 자동 로드 매트릭스

| 이 파일을 편집할 때 | 로드되는 규칙 | 강제 내용 |
|---|---|---|
| 모든 파일 | `rules/always.md` | 기술 스택, `as any` 금지, 인라인 스타일 금지, Context API 금지 |
| `components/enrollment/*.tsx` | `rules/component-files.md` | `'use client'`, CSS 클래스, 폼 상태 패턴 |
| `lib/schemas/*.ts` | `rules/schema-files.md` | `safeParse()` 전용, 한국어 메시지, 네이밍 규칙 |
| `app/api/*/route.ts` | `rules/api-files.md` | 서버 검증, 에러 포맷, HTTP 상태 코드 |
| `lib/api/*.ts` | `rules/client-api-files.md` | `apiClient` 사용, HTTPError 처리, React Query 사용 |
| `test/**/*.test.tsx` | `rules/test-files.md` | API 모킹, 유효+무효 케이스, 사용자 흐름 |
| `app/globals.css` | `rules/css-files.md` | 디자인 토큰, 하드코딩 색상 금지 |

## 태스크 라우팅

| 태스크 | 읽을 것 | 위임 대상 |
|---|---|---|
| 폼 스텝/컴포넌트 | `skills/form-patterns/SKILL.md` | `agents/form-builder.md` |
| Zod 스키마 변경 | `rules/schema-files.md` | 직접 (최소 변경) |
| API 라우트 변경 | `skills/api-mock/SKILL.md` | `agents/api-test.md` |
| 테스트 작성/수정 | `skills/testing/SKILL.md` | `agents/api-test.md` |
| CSS/디자인 변경 | `rules/css-files.md` | `visual-engineering` 카테고리 |
| 아키텍처 결정 | `context.md` | Oracle (read-only, 필요할 때만) |
| 단일 파일 수정/버그 | 해당 rules 파일 | 직접 실행 |

## 위임 프롬프트 템플릿

에이전트에게 위임할 때 이 구조를 사용:

```
[CONTEXT] 어떤 파일(들), 어떤 패턴, 어떤 접근법
[GOAL] 구체적인 결과물
[DOWNSTREAM] 결과를 어떻게 사용할지
[REQUEST] 무엇을 찾을지/만들지, 어떤 포맷, 무엇을 건너뛸지
```

위임 후 체크:
1. 변경 파일에 `lsp_diagnostics` 확인
2. MUST DO / MUST NOT DO 제약 대조
3. `npm run test` 통과 확인

## 핵심 제약

1. **외부 UI 라이브러리 금지** — `globals.css` 기반 Plain CSS 전용
2. **`as any` / `@ts-ignore` 금지** — strict TypeScript 유지
3. **인라인 스타일 금지** — CSS custom properties 사용
4. **폼 상태에 Context API 금지** — orchestrator 패턴 전용
5. **서버 재검증 필수** — 모든 API 라우트에서
6. **에러 메시지 한국어** — 사용자 facing
7. **테스트 삭제/스킵 금지** — 빌드 통과 목적 금지
