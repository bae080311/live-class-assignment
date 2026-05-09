# 규칙 대상: app/globals.css + tailwind.config.ts

## ANY CSS/Tailwind 설정 편집 시

### 필수 사항
1. 새 색상/간격은 `tailwind.config.ts` 의 `theme.extend` 에 추가 — 임의 값(`[...]`) 최소화
2. 디자인 토큰(brand, danger, ink-* 등)은 config 에 정의된 것 사용
3. `globals.css` 는 Tailwind 지시문 + 전역 베이스 스타일만 유지
4. 컴포넌트별 스타일은 해당 컴포넌트 파일의 className 으로

### globals.css 구조
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 폰트 임포트 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

/* 전역 베이스만 */
@layer base {
  body {
    @apply font-sans text-ink-1 bg-[#e9ebef];
  }
}
```

### tailwind.config.ts 토큰

| 카테고리 | 클래스 예시 | 용도 |
|---|---|---|
| `colors.brand` | `bg-brand`, `text-brand` | 주요 액션 |
| `colors.danger` | `text-danger`, `bg-danger-soft` | 에러 |
| `colors.success` | `text-success` | 성공 |
| `colors.ink.1~5` | `text-ink-1` ~ `text-ink-5` | 텍스트 회색조 |
| `borderRadius.sm~xl` | `rounded-sm` ~ `rounded-xl` | 테두리 반지름 |
| `fontFamily.sans` | 자동 적용 | Pretendard |

### 새 토큰 추가 시
`tailwind.config.ts` 의 `theme.extend` 에 추가:
```ts
theme: {
  extend: {
    colors: {
      'new-color': 'oklch(...)',
    }
  }
}
```

### 안티패턴
- ❌ 임의 값 남발 (`text-[#333]` → `text-ink-1`)
- ❌ 컴포넌트 스타일을 globals.css 에 작성
- ❌ `!important` 사용
- ❌ tailwind.config.ts 외부에 새 디자인 토큰 하드코딩
