# 프로젝트 컨텍스트 — live-class-assignment

## 아키텍처 개요

```
┌─────────────────────────────────────────────────┐
│                  EnrollmentForm                  │
│            (상태 머신 오케스트레이터)              │
│  ┌─────────┐  ┌──────────┐  ┌─────────────────┐ │
│  │ Step 1  │→ │  Step 2  │→ │    Step 3       │ │
│  │ 강의 선택│  │ 수강생   │  │  확인 +         │ │
│  │         │  │   정보   │  │   제출           │ │
│  └─────────┘  └──────────┘  └─────────────────┘ │
│        ↓              ↓               ↓          │
│   localState      react-hook-form    결합        │
│   (useState)      (Step2 필드)       state 병합   │
└────────────────────────┬────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
        /api/courses         /api/enrollments
        (GET) mock           (POST) mock + 검증
              │                     │
         lib/db.ts            lib/db.ts
      (data/db.json)       (data/db.json)
```

## 상태 흐름

| 상태 | 저장소 | 범위 |
|---|---|---|
| courseId, type | `localState` (useState) | 스텝 간 공통 |
| name, email, phone | `react-hook-form` | Step 2 |
| motivation | `react-hook-form` | Step 2 |
| organizationName, headCount | `localState` | Step 2 (단체) |
| participants | `localState` | Step 2 (단체) |
| agreed | `localState` | Step 3 |
| step | `useState<Step>` | 네비게이션 |

## 검증 파이프라인

```
클라이언트                   서버
──────                       ──────
Step1: validateStep1() →     Step1Schema.safeParse()
Step2: schema.safeParse() →  Step2{Personal,Group}Schema.safeParse()
Step3: Step3Schema.safeParse() → Step3Schema.safeParse()
                             + 강의 존재 확인
                             + 정원 확인
                             + 중복 신청 확인
```

## 주요 파일

| 파일 | 용도 | 라인 |
|---|---|---|
| `components/enrollment/EnrollmentForm.tsx` | 오케스트레이터 | ~300 |
| `lib/schemas/enrollment.ts` | Zod 스키마 + 타입 | ~92 |
| `lib/api/courses.ts` | 강의 API 래퍼 | ~13 |
| `lib/api/enrollments.ts` | 신청 API 래퍼 | ~45 |
| `app/api/courses/route.ts` | 강의 mock 핸들러 | ~20 |
| `app/api/enrollments/route.ts` | 신청 mock 핸들러 | ~116 |
| `lib/db.ts` | 파일 기반 DB (data/db.json) | — |
| `app/globals.css` | 디자인 시스템 | ~570 |

## 데이터 타입

```typescript
// 핵심 폼 데이터
EnrollmentFormData {
  courseId: string
  type: 'personal' | 'group'
  name: string
  email: string
  phone?: string
  motivation?: string
  organizationName?: string    // 단체 전용
  headCount?: number           // 단체 전용
  participants?: [...]         // 단체 전용
  contactPerson?: string       // 단체 전용, 전화번호 형식
  agreed?: boolean
}

// API 응답
EnrollmentResult { enrollmentId, status, enrolledAt }
ErrorResponse { code, message, details?: Record<string, string[]> }
```

## CSS 디자인 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--ink-1` ~ `--ink-5` | 회색조 | 텍스트, 보더 |
| `--brand` | OKLCH(0.52 0.18 268) | 주요 액션 |
| `--danger` | OKLCH(0.58 0.21 25) | 에러 |
| `--success` | OKLCH(0.62 0.15 155) | 성공 상태 |
| `--r-sm` ~ `--r-xl` | 10px ~ 28px | 테두리 반지름 |

## 에러 코드

| 코드 | HTTP 상태 | 의미 |
|---|---|---|
| `COURSE_FULL` | 409 | 정원 초과 |
| `DUPLICATE_ENROLLMENT` | 409 | 중복 신청 |
| `INVALID_INPUT` | 400 | 유효성 검증 실패 |
