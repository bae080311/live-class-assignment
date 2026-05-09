'use client'

import { IconBack } from '@/assets/svg'

type Props = {
  step: number
  totalSteps: number
  onBack: () => void
}

export function TopBar({ step, totalSteps, onBack }: Props) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-5">
      <button
        className="w-10 h-10 grid place-items-center border-none bg-transparent rounded-full text-ink-2 cursor-pointer hover:bg-ink-5/50 transition-colors"
        onClick={onBack}
        aria-label="이전"
      >
        <IconBack />
      </button>
      <div className="flex-1 text-center text-sm font-medium text-ink-3 tabular-nums tracking-tight">
        <b className="text-ink-1 font-semibold">{step}</b> / {totalSteps}
      </div>
      <div className="w-10" />
    </div>
  )
}
