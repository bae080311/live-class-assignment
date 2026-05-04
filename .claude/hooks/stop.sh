#!/bin/bash
# Stop hook — Claude 작업 완료 전 품질 게이트
echo "▶ 전체 테스트 실행 중..."
npx vitest run --reporter=verbose 2>&1 | tail -15

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ 테스트 실패 — 작업을 완료하기 전에 수정해주세요." >&2
  exit 1
fi

echo "✓ 모든 테스트 통과"
