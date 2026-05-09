'use client'

import { useState } from 'react'
import { CATEGORY_MAP, CHIP_LABELS, formatPrice, formatDate } from '@/lib/constants/enrollment'
import { cn } from '@/lib/utils/cn'
import type { Course } from '@/lib/schemas/enrollment'
import type { EnrollmentFormData } from '@/lib/schemas/enrollment'
import { IconCheck, IconCalendar, IconAlertSm, IconPerson, IconPeople } from '@/assets/svg'

type Props = {
  state: Partial<EnrollmentFormData>
  set: (patch: Partial<EnrollmentFormData>) => void
  showError: boolean
  courses: Course[]
  isLoading: boolean
}

export function Step1CourseSelect({ state, set, showError, courses, isLoading }: Props) {
  const [cat, setCat] = useState('전체')

  const filtered = cat === '전체' ? courses : courses.filter(c => c.category === CATEGORY_MAP[cat])

  const selected = courses.find(c => c.id === state.courseId)

  return (
    <>
      <div>
        <h1 className="text-[26px] leading-tight tracking-[-0.025em] font-bold mb-2 text-ink-1">
          어떤 강의를 들어볼까요?
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-3 m-0 tracking-tight">
          관심 있는 강의를 하나 선택해주세요.
        </p>
      </div>

      {showError && !selected && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-soft text-danger text-sm" role="alert">
          <IconAlertSm />
          <span>강의를 먼저 선택해주세요.</span>
        </div>
      )}

      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none [scrollbar-width:none]"
        role="tablist"
      >
        {CHIP_LABELS.map(c => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            className={cn(
              'flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all',
              cat === c
                ? 'bg-brand text-white border-brand'
                : 'bg-white border-ink-5 text-ink-2 hover:border-ink-4'
            )}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-ink-4 text-center py-5">강의를 불러오는 중...</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(c => {
            const isSel = state.courseId === c.id
            return (
              <div
                key={c.id}
                className={cn(
                  'bg-white rounded-xl p-4 grid gap-3.5 items-center border cursor-pointer transition-all [grid-template-columns:1fr_auto]',
                  isSel ? 'border-brand shadow-md ring-1 ring-brand/20' : 'border-ink-5 hover:shadow-md'
                )}
                onClick={() => set({ courseId: c.id })}
                role="button"
                aria-pressed={isSel}
              >
                <div className="min-w-0">
                  <div className="text-base font-semibold tracking-[-0.02em] text-ink-1 truncate mb-1">
                    {c.title}
                  </div>
                  <div className="text-[13px] text-ink-3 tracking-tight flex gap-2 items-center">
                    <span>{c.instructor}</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-ink-5 flex-shrink-0" />
                    <span className="inline-flex items-center gap-1">
                      <IconCalendar /> {formatDate(c.startDate)}
                    </span>
                  </div>
                </div>
                <div className="text-[15px] font-semibold text-ink-1 tracking-[-0.02em] tabular-nums text-right">
                  {formatPrice(c.price)}
                  <span className="block text-[11px] text-ink-4 font-medium">1인 기준</span>
                </div>
                <div
                  className={cn(
                    'absolute top-3 right-3 w-[22px] h-[22px] rounded-full border-[1.5px] grid place-items-center transition-all',
                    isSel ? 'bg-brand border-brand opacity-100' : 'border-ink-4 bg-white opacity-0'
                  )}
                >
                  <IconCheck className={cn(isSel ? 'text-white' : 'text-transparent')} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="bg-brand text-white rounded-xl p-3.5 flex items-center gap-3 animate-[slideUp_360ms_ease-out]">
          <div className="w-7 h-7 rounded-full bg-white/20 grid place-items-center flex-shrink-0">
            <IconCheck />
          </div>
          <div className="flex-1 min-w-0">
            <small className="text-xs opacity-70 tracking-tight">이 강의를 선택했어요</small>
            <div className="text-sm font-semibold tracking-[-0.02em] mt-0.5">{selected.title}</div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between text-sm font-semibold tracking-[-0.02em] text-ink-2 mb-2 mx-0.5">
          신청 유형
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            className={cn(
              'flex flex-col gap-1 p-4 rounded-md border-2 cursor-pointer text-left transition-all bg-white',
              state.type === 'personal' ? 'border-brand shadow-sm ring-1 ring-brand/20' : 'border-ink-5 hover:border-ink-4'
            )}
            onClick={() => set({ type: 'personal' })}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-[10px] grid place-items-center mb-2.5',
                state.type === 'personal' ? 'bg-brand text-white' : 'bg-ink-5/50 text-ink-2'
              )}
            >
              <IconPerson />
            </div>
            <div className="text-sm font-semibold tracking-[-0.02em] text-ink-1">개인 신청</div>
            <div className="text-xs text-ink-3 tracking-tight">혼자 수강해요</div>
          </button>
          <button
            className={cn(
              'flex flex-col gap-1 p-4 rounded-md border-2 cursor-pointer text-left transition-all bg-white',
              state.type === 'group' ? 'border-brand shadow-sm ring-1 ring-brand/20' : 'border-ink-5 hover:border-ink-4'
            )}
            onClick={() => set({ type: 'group' })}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-[10px] grid place-items-center mb-2.5',
                state.type === 'group' ? 'bg-brand text-white' : 'bg-ink-5/50 text-ink-2'
              )}
            >
              <IconPeople />
            </div>
            <div className="text-sm font-semibold tracking-[-0.02em] text-ink-1">단체 신청</div>
            <div className="text-xs text-ink-3 tracking-tight">2명 이상 함께</div>
          </button>
        </div>
        <div className="text-xs text-ink-4 mt-2.5 px-1 tracking-tight">
          선택한 강의는 다음 단계에서 다시 확인할 수 있어요.
        </div>
      </div>
    </>
  )
}
