'use client'

import { useEffect } from 'react'
import { IconSave, IconX } from '@/assets/svg'
import type { SaveState } from '@/lib/schemas/enrollment'

export function SaveBanner({ state }: { state: SaveState }) {
  switch (state) {
    case 'saved':
    case 'saving':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-brand-soft text-ink-1 text-sm">
          <div className="relative flex-shrink-0 w-2 h-2 rounded-full bg-success">
            <div className="absolute inset-[-3px] rounded-full bg-success opacity-30 animate-pulse" />
          </div>
          <span>
            <b className="text-ink-1 font-semibold">자동 저장됨</b> · 작성 중인 내용이 안전하게 보관되고 있어요
          </span>
        </div>
      )
    case 'fail':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber/10 text-ink-1 text-sm">
          <div className="relative flex-shrink-0 w-2 h-2 rounded-full bg-amber">
            <div className="absolute inset-[-3px] rounded-full bg-amber opacity-30 animate-pulse" />
          </div>
          <span>자동 저장이 잠시 멈췄어요. 잠시 후 다시 시도할게요.</span>
        </div>
      )
  }
}

const RECOVER_TIMEOUT = 8000

export function RecoverBanner({
  onRecover,
  onDismiss,
}: {
  onRecover: () => void
  onDismiss: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, RECOVER_TIMEOUT)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
      <div className="w-full max-w-[560px] bg-brand text-white rounded-2xl shadow-[0_8px_32px_rgba(37,99,235,0.25)] overflow-hidden animate-slide-up pointer-events-auto">
        <div className="h-[3px] bg-white/15">
          <div className="h-full bg-white/50 animate-shrink-8" />
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 text-sm">
          <IconSave style={{ color: 'oklch(0.78 0.13 155)', flexShrink: 0 }} />
          <span className="flex-1 tracking-tight leading-snug">
            이전에 작성하던 내용이 있어요. 이어서 작성할까요?
          </span>
          <button
            onClick={onRecover}
            className="bg-white/20 hover:bg-white/30 transition-colors border-none text-white text-xs font-semibold rounded-lg px-3 py-1.5 cursor-pointer flex-shrink-0"
          >
            이어서 작성
          </button>
          <button
            onClick={onDismiss}
            className="bg-transparent border-none text-white opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-1 flex-shrink-0"
            aria-label="닫기"
          >
            <IconX />
          </button>
        </div>
      </div>
    </div>
  )
}
