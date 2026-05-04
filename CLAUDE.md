# CLAUDE.md — live-class-assignment

강의 수강 신청 다단계 폼 (Next.js 16 · React 19 · TypeScript)

## 아키텍처

```
EnrollmentForm (오케스트레이터)
  ├── Step 1: 강의 선택     → localState (courseId, type)
  ├── Step 2: 수강생 정보   → react-hook-form (name, email, phone…)
  ├── Step 3: 확인 + 제출   → localState + getValues() 병합
  └── Result: success / fail

클라이언트                  서버
lib/api/courses.ts         app/api/courses/route.ts
lib/api/enrollments.ts     app/api/enrollments/route.ts
  └── apiClient (ky)         └── lib/db.ts → data/db.json
```

## 커맨드

```bash
npm run dev           # 개발 서버
npm run build         # 프로덕션 빌드
npm run test          # Vitest 실행
npm run test:coverage # 커버리지
npm run lint          # ESLint
npm run format        # Prettier
```

## 핵심 규칙

| 규칙 | 내용 |
|---|---|
| 기술 스택 | Next.js 16, React 19, TS 5, RHF 7, Zod 4, React Query 5 |
| 스타일 | Tailwind CSS v3 — `tailwind.config.ts` 토큰 사용 |
| 폼 상태 | 오케스트레이터 패턴 — Context API 금지 |
| 검증 | `safeParse()` + 서버 재검증 필수 |
| 메시지 | 사용자 facing 한국어 전용 |
| 타입 | strict 모드 — `as any` / `@ts-ignore` 금지 |
| 테스트 | Vitest + Testing Library — 80%+ 커버리지 |

## .claude/ 구성

세부 규칙·패턴·에이전트는 `.claude/`에 있습니다. 태스크 시작 전 `README.md` 참조.

```
.claude/
├── README.md              ← 색인 + 자동 로드 매트릭스 + 태스크 라우팅
├── context.md             ← 아키텍처 상세, 데이터 타입, 에러 코드
├── rules/                 ← 파일 패턴별 자동 로드
├── skills/                ← 복잡한 태스크 시 명시적 로드
│   ├── form-patterns/SKILL.md
│   ├── api-mock/SKILL.md
│   └── testing/SKILL.md
├── agents/                ← 서브에이전트 (YAML frontmatter)
│   ├── form-builder.md
│   └── api-test.md
├── hooks/
│   ├── preToolUse.sh      ← 위험 명령어 차단
│   ├── postToolUse.sh     ← TS/CSS 자동 포맷 + 관련 테스트 실행
│   └── stop.sh            ← 작업 완료 전 전체 테스트 품질 게이트
└── settings.json          ← 권한, 훅, 언어, effortLevel
```
