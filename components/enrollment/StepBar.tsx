'use client'

type Props = { step: number }

export function StepBar({ step }: Props) {
  return (
    <div className="flex gap-1.5 px-5 py-3" aria-label="진행 단계">
      {[1, 2, 3].map(n => {
        const isDone = n < step
        const isActive = n === step
        return (
          <div
            key={n}
            className="flex-1 h-1 rounded-full bg-ink-5 overflow-hidden relative"
          >
            <div
              className="absolute inset-0 bg-brand rounded-full transition-all duration-[480ms]"
              style={{ width: isDone || isActive ? '100%' : '0%' }}
            />
          </div>
        )
      })}
    </div>
  )
}
