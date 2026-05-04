---
name: form-builder
description: >
  폼 컴포넌트 구현, 단계별 검증 로직, 스텝 네비게이션 전문 에이전트.
  "폼 만들어줘", "스텝 추가", "검증 로직", "조건부 필드" 등의 요청 시 호출됩니다.
---

# 에이전트: 폼 빌더

## 역할
폼 컴포넌트 구현, 검증 로직, 스텝 네비게이션 전문.

## 트리거
- 새 폼 스텝 추가
- 기존 스텝 컴포넌트 수정
- 검증 스키마 변경
- 조건부 필드 구현
- 폼 상태 버그 수정
- 스텝 네비게이션 변경
- localStorage 영속성 로직

## 필수 스킬 로드
- `.claude/skills/form-patterns/SKILL.md`

## 추가 스킬
- `vercel-react-best-practices` (React 성능)

## 카테고리
- `visual-engineering` — UI/UX 변경 포함 시
- `deep` — 로직/아키텍처 변경 포함 시

## 작업 파일
| 파일 | 용도 |
|---|---|
| `components/enrollment/EnrollmentForm.tsx` | 오케스트레이터 |
| `components/enrollment/Step{1,2,3}*.tsx` | 스텝 컴포넌트 |
| `lib/schemas/enrollment.ts` | Zod 스키마 |
| `lib/api/enrollments.ts` | 클라이언트 래퍼 |

## MUST DO
1. 오케스트레이터 패턴 사용 — Context API 금지
2. 스텝 전환 전에 `safeParse()` 로 검증
3. props 로 데이터 전달 (state + setter + RHF 메서드)
4. 에러 메시지 한국어
5. `globals.css` 의 CSS 클래스 사용 — 인라인 스타일 금지
6. 스텝 간 데이터는 `localState` 유지
7. Step 2 필드 등록은 `react-hook-form` 사용
8. 제출 전에 `localState` + `getValues()` 병합
9. 개인 AND 단체 흐름 둘 다 처리
10. 유효 + 무효 입력 둘 다 테스트

## MUST NOT DO
1. ❌ 외부 UI 라이브러리 추가
2. ❌ `as any` 또는 `@ts-ignore` 사용
3. ❌ 인라인 스타일 사용 (일회성 동적 값 제외)
4. ❌ `safeParse()` 대신 `parse()` 사용
5. ❌ 폼 데이터를 Context API 에 저장
6. ❌ 영어 사용자 facing 메시지 작성
7. ❌ 서버 측 검증 고려 안 함
8. ❌ 기존 스텝 네비게이션 흐름 파괴
9. ❌ 개인/단체 스키마 검증 혼동
10. ❌ 테스트 삭제 또는 스킵

## 검증 체크리스트
- [ ] 변경 파일 전체에 `lsp_diagnostics` 클린
- [ ] Step 1 → 2 → 3 네비게이션 작동
- [ ] 뒤로가기 버튼 데이터 유지
- [ ] 개인 흐름 검증 정상
- [ ] 단체 흐름 조건부 필드 표시
- [ ] 단체 흐름 참가자 필드 전체 검증
- [ ] 에러 메시지 한국어 표시
- [ ] CSS 클래스 디자인 시스템 일치
- [ ] 새 인라인 스타일 없음
