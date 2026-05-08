# live-class-assignment

강의 수강 신청을 위한 3단계 멀티스텝 폼 웹 애플리케이션입니다. 강의 선택, 개인/단체 신청 정보 입력, 신청 내용 확인, 약관 동의, 제출 결과 화면까지 하나의 흐름으로 제공합니다.

## 기술 스택

| 계층 | 기술 | 버전 |
|---|---|---|
| 프레임워크 | Next.js App Router | 16.x |
| UI | React | 19.x |
| 언어 | TypeScript strict | 5.x |
| 폼 관리 | react-hook-form | 7.x |
| 스키마 검증 | Zod | 4.x |
| 데이터 패칭 | ky + TanStack React Query | 5.x |
| 스타일링 | Tailwind CSS | v3 |
| 테스트 | Vitest + Testing Library | latest |

## 실행 방법

```bash
npm install
npm run dev            # 개발 서버 실행 (http://localhost:3000)
npm run build          # 프로덕션 빌드
npm run test           # 테스트 실행
npm run test:coverage  # 커버리지 리포트 생성
npm run lint           # ESLint 검사
npm run format         # Prettier 포맷팅
```

## 화면 흐름

```text
Step 1
강의 선택 + 신청 유형 선택
  ↓
Step 2
개인 신청: 이름, 이메일, 전화번호, 수강 동기
단체 신청: 담당자 정보, 단체명, 담당자 연락처, 참가자 목록
  ↓
Step 3
신청 내용 확인 + 약관 동의
  ↓
Result
신청 완료 또는 실패 화면
```

## 아키텍처

```text
app/
  api/courses/route.ts        # GET  /api/courses
  api/enrollments/route.ts    # POST /api/enrollments
  page.tsx                    # 루트 페이지
  providers.tsx               # React Query Provider

components/enrollment/        # 수강 신청 UI 컴포넌트
  EnrollmentForm              # UI 렌더링 (오케스트레이터)
    └── useEnrollmentForm     # 폼 상태와 비즈니스 흐름
          ├── useFormPersistence   - localStorage 임시저장/복구
          ├── useParticipantList   - 참가자 배열 resize/update
          ├── react-hook-form      - Step 2 입력 필드 관리
          └── TanStack Query       - 강의 목록 조회 / 신청 제출

lib/
  api/          # 클라이언트 API wrapper (apiClient, courses, enrollments)
  hooks/        # 폼 흐름·저장·참가자 관리 훅
  schemas/      # Zod 스키마와 공통 타입
  services/     # 서버 비즈니스 로직 (enrollment.ts)
  db.ts         # 파일 기반 mock DB → data/db.json

test/
  api/ · components/ · lib/ · schemas/
```


## 요구사항 해석 및 가정

**필수 구현**

| 항목 | 구현 여부 |
|---|---|
| 강의 목록 조회 + 카테고리 필터 | ✅ |
| 선택한 강의 정보(제목·가격·일정) 표시 | ✅ |
| 개인/단체 신청 유형 선택 | ✅ |
| 공통 필드: 이름(2~20자)·이메일·전화번호·수강동기(선택, 300자) | ✅ |
| 단체 추가 필드: 단체명·신청 인원(2~10명)·참가자 명단·담당자 연락처 | ✅ |
| 3단계 확인 화면: 전체 요약 + 섹션별 수정 링크 | ✅ |
| 이용약관 동의 체크박스 | ✅ |
| 제출 성공: 신청 번호 + 요약 정보 | ✅ |
| 제출 실패: 에러 메시지 + 재시도(입력 데이터 유지) | ✅ |
| 스텝별 유효성 검증 + 필드 에러 메시지 | ✅ |
| 이전 단계 복귀 시 입력 데이터 유지 | ✅ |
| 스텝 인디케이터 | ✅ |

**선택 구현 (추가 점수)**

| 항목 | 구현 여부 |
|---|---|
| 임시저장: 새로고침 후 입력 데이터 복구 | ✅ |
| 이탈 방지: 뒤로가기/닫기 시 확인 대화상자 | ✅ |
| 반응형 레이아웃 (모바일 대응) | ✅ |

**스펙에서 명시되지 않은 항목 해석**

- **`contactPerson` 필드**: `string` 타입만 있고 설명이 없어 담당자 전화번호로 해석했습니다. 한국 전화번호 형식으로 검증합니다.
- **참가자 이메일 형식 검증**: 스펙 참가자 스키마에 형식 검증이 없지만, 안내 메일 발송에 쓰이는 값이므로 추가했습니다.
- **Mock API 구성 방식**: 스펙이 방식을 자유로 두어 MSW 대신 Next.js API Route로 직접 구현했습니다. `npm run dev` 하나로 실행 가능하고, `data/db.json`을 파일 DB로 사용해 정원·중복 확인 등 실제 서버 동작을 재현합니다.
- **임시저장 시작 시점**: 강의를 선택하거나 Step 2 이상 진입한 시점부터 저장합니다. 아무것도 입력하지 않은 빈 Step 1은 저장하지 않습니다.
- **인원수 변경 시 참가자 배열 처리**: 늘리면 빈 항목을 추가하고, 줄이면 마지막 항목부터 제거합니다.

## 설계 결정과 이유

**오케스트레이터 패턴 (Context API 미사용)**
`useEnrollmentForm`이 스텝, 로컬 상태, react-hook-form 값, 제출 상태, 임시저장 상태를 모두 소유하고 `EnrollmentForm`은 렌더링만 담당합니다. Context를 쓰면 어느 컴포넌트가 어떤 상태를 소비하는지 추적이 어려워지므로, 단방향 데이터 흐름을 명시적으로 유지하기 위해 props로만 전달합니다.

**react-hook-form + 로컬 상태 분리**
이름·이메일·전화번호·수강 동기처럼 일반 입력 필드는 react-hook-form으로 관리합니다. 강의 ID·신청 유형·참가자 목록·약관 동의처럼 스텝 간 공유되거나 커스텀 UI와 강하게 연결된 값은 로컬 상태로 관리합니다. 모든 값을 RHF에 넣으면 커스텀 컴포넌트마다 `Controller`를 감싸야 해 오히려 복잡해지기 때문입니다.

**Zod 수동 검증 (`zodResolver` 미사용)**
스텝마다 적용할 스키마가 다르고(Step2PersonalSchema vs Step2GroupSchema), 서버 에러를 `setError()`로 특정 필드에 주입해야 하는 경우가 있어 `zodResolver` 대신 스텝 전환 시점에 `safeParse()`를 직접 호출합니다. `zodResolver`는 단일 스키마를 폼 전체에 고정하기 때문에 이 요구사항에 맞지 않습니다.

**서비스 레이어 분리**
`app/api/enrollments/route.ts`는 요청 파싱과 HTTP 응답 생성만 담당합니다. 입력 검증·중복 신청 확인·정원 확인·DB 저장은 `lib/services/enrollment.ts`로 분리했습니다. 라우트 핸들러에 비즈니스 로직이 섞이면 HTTP 관심사와 도메인 로직이 뒤엉켜 테스트와 유지보수가 어려워집니다.

**파일 기반 mock DB**
`data/db.json`을 Node.js `fs`로 읽고 씁니다. 실제 DB를 연동하면 환경 설정 부담이 커지지만, 이 프로젝트는 폼 흐름과 API 구조 검증이 목적이므로 파일 DB로 충분합니다. DB 접근은 `lib/db.ts`의 함수로만 제한해 추후 교체 시 이 파일만 수정하면 됩니다.

**ky 공유 인스턴스**
`lib/api/client.ts`에서만 `ky`를 직접 import하고 나머지 래퍼는 `apiClient`를 사용합니다. timeout·retry 설정을 중앙에서 관리하고, 인터셉터 추가 시에도 이 파일 하나만 수정하면 됩니다.

**클라이언트·서버 이중 검증**
클라이언트에서 `safeParse()`로 스텝 전환을 막고, 서버에서도 동일한 Zod 스키마로 재검증합니다. 클라이언트 검증만 믿으면 직접 API 호출로 잘못된 데이터가 저장될 수 있어 서버 재검증을 필수로 적용했습니다.

## 테스트

Vitest와 Testing Library로 스키마, API, DB 유틸, 훅, 컴포넌트 사용자 흐름을 검증합니다.

현재 테스트 실행 결과:

```text
Test Files  16 passed (16)
Tests       224 passed (224)
```

주요 검증 범위:

- Step별 Zod 스키마의 valid/invalid 케이스
- 강의 목록 조회와 신청 API 응답
- 중복 신청, 정원 초과, 입력값 오류
- 멀티스텝 폼 진행, 복구, 제출 흐름
- 단체 참가자 추가/삭제와 참가자별 오류 표시

## 미구현 / 제약사항

- **동시 요청 원자성 제한**: 정원 확인과 저장을 하나의 함수 흐름에서 처리하지만, 실제 DB transaction이나 파일 lock을 사용하는 구조는 아닙니다.
- **한 번에 하나의 강의만 신청 가능**: 폼 흐름상 단일 강의를 선택하고 제출하는 구조로, 여러 강의를 동시에 신청하는 기능은 없습니다.
- **인증 없음**: 이메일 인증, 로그인, 본인 확인은 포함하지 않았습니다.

## AI 활용 범위

여러 AI 도구를 목적에 맞게 나눠 활용했습니다.

- **Claude Code** (claude-sonnet-4-6): 컴포넌트 구현, 검증 파이프라인, API 및 서비스 레이어, 테스트 작성, UI/UX 디자인, `.claude/` 하네스 엔지니어링(rules·skills·agents·hooks)
- **OpenAI Codex**: 코드 생성 보조
- **Gemini Code Review**: 코드 리뷰 및 피드백
- **Cursor**: 코드 검토 및 탐색

코드 구조와 설계 결정은 직접 검토했습니다.
