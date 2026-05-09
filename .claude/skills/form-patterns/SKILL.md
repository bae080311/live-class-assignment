# 스킬: 폼 패턴

## 범위
이 프로젝트에서 react-hook-form + Zod 검증 기반 다단계 폼 구현.

## 언제 로드할까
- 폼 스텝 추가/수정
- 검증 로직 변경
- 폼 상태 버그 수정
- 조건부 필드 구현
- 스텝 네비게이션 수정

## 핵심 패턴

### 1. 오케스트레이터 패턴 (EnrollmentForm.tsx)

루트 폼 컴포넌트가 **단일 오케스트레이터**다. 다음을 관리:
- `step` 상태: `1 | 2 | 3 | 'success' | 'fail'`
- `localState`: `useState<Partial<EnrollmentFormData>>` 를 통한 스텝 간 데이터
- `react-hook-form`: Step 2 필드 등록 + 검증
- 사전 검증付き 스텝 전환

**절대** 폼 상태에 Context API 도입 금지. 오케스트레이터는 props 로 데이터를 전달한다.

### 2. 검증 흐름

```typescript
// 클라이언트: 스텝 전환 전에 검증
const handleNext = async () => {
  if (step === 1) {
    const result = validateStep1(localState)
    if (!result.success) { /* 에러 표시 */; return }
    setStep(2)
  }
  // ...
}

// 서버: API 라우트에서 재검증
const step1 = Step1Schema.safeParse(body)
if (!step1.success) {
  return NextResponse.json({
    code: 'INVALID_INPUT',
    message: '입력값이 올바르지 않아요.',
    details: step1.error.flatten().fieldErrors,
  }, { status: 400 })
}
```

### 3. 조건부 필드 (개인 vs 단체)

```typescript
// 유형에 따른 스키마 선택
const schema = localState.type === 'group'
  ? Step2GroupSchema
  : Step2PersonalSchema

// 단체 전용 필드를 localState 에 설정
if (type === 'group') {
  set({ organizationName: '', headCount: 2, participants: [...], contactPerson: '' })
}
```

### 4. 상태 병합 패턴

Step 컴포넌트는 `localState` 와 RHF 메서드를 둘 다 받음:

```typescript
<Step2StudentInfo
  state={localState}
  set={set}
  register={register}
  errors={errors}
/>
```

Step 3 은 두 소스를 병합:
```typescript
const merged = { ...localState, ...getValues() }
```

### 5. 에러 표시 패턴

```typescript
// Zod 에러 → RHF 에러 매핑
const fieldErrors = result.error.flatten().fieldErrors
const fields = ['name', 'email', 'phone', 'organizationName', 'contactPerson'] as const
fields.forEach(field => {
  const msg = fieldErrors[field]?.[0]
  if (msg) setError(field, { message: msg })
})
```

### 6. localStorage 영속성

키: `enrollment-form-draft`
- 상태 변경 시마다 저장 (디바운스)
- 마운트 시 복원
- 제출 성공 시 삭제

### 안티패턴

| 패턴 | 왜 나쁜가 | 해결 |
|---|---|---|
| 폼 상태에 Context API | 오케스트레이터 패턴 파괴, 불필요 리렌더 | props 전달 |
| `safeParse()` 대신 `parse()` | 예외 던짐, 에러 처리 흐름 파괴 | 항상 `safeParse()` |
| 폼 필드에 인라인 스타일 | 디자인 시스템 일관성 파괴 | `.field`, `.input` 클래스 사용 |
| 모든 데이터를 RHF 에 저장 | 스텝 간 데이터 손실 | 스텝 간 데이터는 `localState` |
| 영어 에러 메시지 | 사용자 facing 은 한국어 | 한국어 전용 |
