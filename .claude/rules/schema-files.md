# 규칙 대상: lib/schemas/*.ts

## lib/schemas/ 에서 ANY 스키마 파일 편집 시

### 필수 사항
1. `zod` 에서 임포트 — `import { z } from 'zod'`
2. 스키마 내보내기: `export const {Name}Schema = z.object({...})`
3. 타입 내보내기: `export type {Name} = z.infer<typeof {Name}Schema>`
4. 검증에는 `safeParse()` 사용 — `parse()` 절대 금지
5. 에러 메시지 모두 한국어

### 스키마 네이밍 규칙
```typescript
Step1Schema           // Step 1: 강의 선택 + 신청 유형
Step2PersonalSchema   // Step 2: 개인 신청자 정보
Step2GroupSchema      // Step 2: 단체 신청자 + 참가자
Step3Schema           // Step 3: 이용약관 동의
CourseSchema          // 강의 데이터 타입
```

### 검증 헬퍼 패턴
```typescript
export function validateStepN(data: Partial<EnrollmentFormData>) {
  return StepNSchema.safeParse(data)
}
```

### 주요 검증 규칙
| 필드 | 규칙 | 예시 |
|---|---|---|
| name | 2~20자 | `z.string().min(2).max(20)` |
| email | 이메일 형식 | `z.string().email()` |
| phone | 한국 전화번호 | `z.string().regex(/^01[016789]-?\d{3,4}-?\d{4}$/)` |
| motivation | 최대 300자, 선택 | `z.string().max(300).optional()` |
| headCount | 2~10, 정수 | `z.number().int().min(2).max(10)` |
| agreed | true 여야 함 | `z.literal(true)` |

### 안티패턴
- ❌ `.safeParse()` 대신 `.parse()` 사용
- ❌ `.min()`, `.max()` 등에 영어 에러 메시지
- ❌ `any` 타입과 스키마 타입 혼용
- ❌ 클라이언트/서버 파일 간 스키마 로직 중복
