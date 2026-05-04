#!/bin/bash
# PreToolUse hook — Bash 실행 전 위험 명령어 차단
TOOL_NAME="${CLAUDE_TOOL_NAME}"
TOOL_INPUT="${CLAUDE_TOOL_INPUT_COMMAND}"

# 위험 패턴 차단
if echo "$TOOL_INPUT" | grep -qE 'rm -rf|git push --force|git reset --hard|DROP TABLE|truncate'; then
  echo "차단: 위험한 명령어가 감지됐어요 → $TOOL_INPUT" >&2
  exit 2
fi
