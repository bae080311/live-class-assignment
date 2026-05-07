'use client'

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
          <button
            className="flex-1 h-[50px] px-4 text-ink-2 font-semibold rounded-xl bg-ink-5/50 hover:bg-ink-5/70 transition-colors border-none cursor-pointer"
            onClick={onLeave}
          >
            나갈게요
          </button>
          <button
            className="flex-1 h-[50px] px-4 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover active:scale-[0.98] transition-all border-none cursor-pointer"
            onClick={onStay}
          >
            이어서 작성
          </button>
        </div>
      </div>
    </div>
  )
}
