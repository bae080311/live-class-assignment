# 규칙 대상: components/enrollment/*.tsx

## components/enrollment/ 에서 ANY 컴포넌트 편집 시

### 필수 사항
1. 데이터 전달은 props 로 — Context API 금지
2. 사용자에게 보이는 에러 메시지는 반드시 한국어
3. **Tailwind 유틸리티 클래스** 사용 — 인라인 스타일 금지
4. 기존 컴포넌트 네이밍 준수: `Step{1,2,3}{Name}.tsx`

### 디자인 토큰 (tailwind.config.ts 에 정의됨)

| 토큰 | Tailwind 클래스 예시 | 용도 |
|---|---|---|
| brand | `bg-brand`, `text-brand`, `border-brand` | 주요 액션 |
| danger | `text-danger`, `bg-danger-soft`, `border-danger` | 에러 |
| success | `text-success`, `bg-success-soft` | 성공 |
| ink-1~5 | `text-ink-1`, `text-ink-3` | 텍스트 회색조 |
| 라운딩 | `rounded-sm`(10px) `rounded-md`(14px) `rounded-lg`(20px) `rounded-xl`(28px) | 테두리 반지름 |

### 공통 UI 패턴

```tsx
// 버튼
<button className="w-full bg-brand text-white font-semibold py-3 px-4 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50">
  다음
</button>

// 입력 필드
<input className="w-full px-4 py-3 rounded-md border border-ink-5 text-ink-1 placeholder:text-ink-4 focus:outline-none focus:border-brand transition-colors" />

// 에러 메시지
<p className="text-sm text-danger mt-1">{error.message}</p>

// 카드
<div className="bg-white rounded-xl p-5 shadow-sm border border-ink-5">
```

### 폼 상태 패턴
```typescript
// 스텝 간 데이터 → localState (useState)
const [localState, setLocalState] = useState<Partial<EnrollmentFormData>>(INITIAL)

// Step 2 필드 → react-hook-form
const { register, formState: { errors }, getValues, setError } = useForm<RHFData>({...})

// 자식에게 props 로 전달
<ChildComponent state={localState} set={set} register={register} errors={errors} />
```

### 안티패턴
- ❌ 폼 데이터에 `useContext()` 사용
- ❌ 인라인 `style={{...}}` (진짜 동적 값 제외)
- ❌ 직접 DOM 조작 (`document.getElementById`, `querySelector`)
- ❌ 개별 폼 필드에 `useState` 사용 (RHF 사용)
- ❌ 색상 하드코딩 (`text-[#ff0000]` 대신 `text-danger`)
- ❌ 긴 클래스 문자열은 `cn()` 유틸로 분리 (가독성 확보)
