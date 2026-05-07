'use client'

import { IconAlertSm, IconRefresh, IconX } from '@/assets/svg'

type Props = {
  errorMessage?: string
  onRetry: () => void
  onBack: () => void
}

export function ResultFail({ errorMessage, onRetry, onBack }: Props) {
  const message = errorMessage || '잠시 후 다시 시도해주세요.'
  return (
    <div className="flex flex-col flex-1 p-8 pb-[120px] text-left">
      <div className="w-16 h-16 rounded-[22px] grid place-items-center mb-6 bg-danger text-white">
        <IconX width="32" height="32" />
      </div>
      <h2 className="text-[26px] font-bold leading-tight tracking-[-0.025em] mb-2 text-ink-1">
        신청을 완료하지 못했어요.
      </h2>
      <p className="text-[15px] text-ink-3 leading-relaxed tracking-tight m-0">
        입력한 정보는 그대로 저장되어 있어요.
        <br />
        잠시 후 다시 시도해주세요.
      </p>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-soft text-ink-1 text-sm mt-6">
        <IconAlertSm className="text-danger flex-shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>

      <button
        onClick={onBack}
        className="mt-4 bg-transparent border-none p-0 py-2 text-left text-sm text-ink-3 cursor-pointer underline underline-offset-[3px]"
      >
        이전 단계로 돌아가기
      </button>

      <div className="flex gap-3 p-5 border-t border-ink-5 bg-white mt-auto">
        <button
          className="w-24 h-14 flex-shrink-0 px-4 text-ink-2 font-semibold rounded-xl bg-ink-5/50 hover:bg-ink-5/70 transition-colors border-none cursor-pointer"
          onClick={onBack}
        >
          취소
        </button>
        <button
          className="flex-1 h-14 inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover active:scale-[0.98] transition-all border-none cursor-pointer"
          onClick={onRetry}
        >
          <IconRefresh /> 다시 시도하기
        </button>
      </div>
    </div>
  )
}
