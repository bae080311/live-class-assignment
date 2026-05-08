'use client'

import type { Course, EnrollmentFormData } from '@/lib/schemas/enrollment'
import { formatDate } from '@/lib/constants/enrollment'
import { useCopyFeedback } from '@/lib/hooks/useCopyFeedback'
import { IconCopy, IconCheck } from '@/assets/svg'
import { Button } from './Button'
import { SectionCard, SectionHeader, DataRow } from './SectionCard'

type Props = {
  state: Partial<EnrollmentFormData>
  enrollmentId: string
  courses: Course[]
  onReset: () => void
}

export function ResultSuccess({ state, enrollmentId, courses, onReset }: Props) {
  const course = courses.find(c => c.id === state.courseId)
  const { copied, copy: handleCopy } = useCopyFeedback(enrollmentId)

  return (
    <div className="flex flex-col flex-1 p-8 pb-[120px] text-left">
      {copied && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-3 bg-ink-1 text-white text-sm font-medium rounded-2xl shadow-lg animate-slide-up pointer-events-auto">
            <IconCheck width="16" height="16" aria-hidden />
            신청 번호가 복사됐어요
          </div>
        </div>
      )}
      <div className="w-16 h-16 rounded-[22px] grid place-items-center mb-6 bg-success text-white">
        <IconCheck width="32" height="32" />
      </div>
      <h2 className="text-[26px] font-bold leading-tight tracking-[-0.025em] mb-2 text-ink-1">
        신청이 완료됐어요.
      </h2>
      <p className="text-[15px] text-ink-3 leading-[1.55] tracking-tight m-0">
        강의 일정에 맞춰 안내 메일을 보내드릴게요.
        <br />
        신청 번호를 꼭 확인해주세요.
      </p>

      <div className="flex items-center justify-between p-4 rounded-xl bg-ink-5/50 border border-ink-5 mt-6 mb-4">
        <div>
          <div className="text-sm text-ink-3 tracking-tight">신청 번호</div>
          <div className="text-base font-bold tracking-widest tabular-nums text-ink-1">
            {enrollmentId}
          </div>
        </div>
        <button
          className="bg-transparent border-none p-1.5 text-ink-3 cursor-pointer rounded-lg hover:bg-white hover:text-ink-1 transition-colors grid place-items-center"
          aria-label="복사"
          onClick={handleCopy}
        >
          <IconCopy />
        </button>
      </div>

      <div className="mt-2">
        <SectionCard>
          <SectionHeader title="신청 요약" />
          <DataRow label="강의">{course?.title || '—'}</DataRow>
          <DataRow label="일정">{course?.startDate ? formatDate(course.startDate) : '—'}</DataRow>
          <DataRow label="신청자">{state.name || '—'}</DataRow>
          <DataRow label="유형" last>
            {state.type === 'group' ? `단체 · ${state.headCount}명` : '개인'}
          </DataRow>
        </SectionCard>
      </div>

      <div className="flex gap-3 p-5 border-t border-ink-5 bg-white mt-auto">
        <Button className="flex-1 h-14" onClick={onReset}>
          처음으로 돌아가기
        </Button>
      </div>
    </div>
  )
}
