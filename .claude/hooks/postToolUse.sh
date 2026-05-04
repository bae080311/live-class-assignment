#!/bin/bash
# PostToolUse hook — 파일 편집 후 자동 포맷팅 + 관련 테스트 실행
FILE_PATH="${CLAUDE_TOOL_INPUT_FILE_PATH}"

# ── 자동 포맷팅 ──────────────────────────────────────────
if [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.tsx ]]; then
  npx prettier --write "$FILE_PATH" --quiet 2>/dev/null
fi

if [[ "$FILE_PATH" == *.css ]]; then
  npx prettier --write "$FILE_PATH" --quiet 2>/dev/null
fi

# ── 관련 테스트 자동 실행 ────────────────────────────────
# 테스트 파일 자체를 수정한 경우 → 해당 파일만 실행
if [[ "$FILE_PATH" == test/**/*.test.* ]] || [[ "$FILE_PATH" == */test/*test* ]]; then
  echo "▶ 테스트 실행: $FILE_PATH"
  npx vitest run "$FILE_PATH" --reporter=verbose 2>&1 | tail -20
  exit 0
fi

# 스키마 수정 → 스키마 테스트 실행
if [[ "$FILE_PATH" == *lib/schemas/* ]]; then
  echo "▶ 스키마 테스트 실행"
  npx vitest run test/schemas/ --reporter=verbose 2>&1 | tail -20
  exit 0
fi

# DB 유틸 수정 → lib 테스트 실행
if [[ "$FILE_PATH" == *lib/db.ts ]]; then
  echo "▶ DB 테스트 실행"
  npx vitest run test/lib/ --reporter=verbose 2>&1 | tail -20
  exit 0
fi

# 컴포넌트 수정 → 해당 컴포넌트 테스트 실행 (있으면)
if [[ "$FILE_PATH" == *components/enrollment/*.tsx ]]; then
  COMPONENT=$(basename "$FILE_PATH" .tsx)
  TEST_FILE="test/components/${COMPONENT}.test.tsx"
  if [[ -f "$TEST_FILE" ]]; then
    echo "▶ 컴포넌트 테스트 실행: $TEST_FILE"
    npx vitest run "$TEST_FILE" --reporter=verbose 2>&1 | tail -20
  fi
fi
