'use client'

import { Button } from './Button'

type Props = {
  onStay: () => void
  onLeave: () => void
}

export function LeaveModal({ onStay, onLeave }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end z-50"
      onClick={onStay}
    >
      <div
        className="w-full bg-white rounded-t-2xl p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="m-0 text-lg font-bold text-ink-1 tracking-tight">지금 나가시겠어요?</h3>
        <p className="m-0 text-sm text-ink-3 leading-relaxed tracking-tight">
          작성하던 내용은 안전하게 저장되어 있어서, 다음에 이어서 신청할 수 있어요.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 h-[50px]" onClick={onLeave}>
            나갈게요
          </Button>
          <Button className="flex-1 h-[50px]" onClick={onStay}>
            이어서 작성
          </Button>
        </div>
      </div>
    </div>
  )
}
