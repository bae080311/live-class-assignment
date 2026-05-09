'use client'

import { useState } from 'react'
import type { Course, EnrollmentFormData } from '@/lib/schemas/enrollment'
import { formatPrice, formatDate } from '@/lib/constants/enrollment'
import { cn } from '@/lib/utils/cn'
import { IconAlertSm, IconCheck, IconX } from '@/assets/svg'
import { SectionCard, SectionHeader, DataRow } from './SectionCard'
import { Button } from './Button'

type Props = {
  state: Partial<EnrollmentFormData>
  set: (patch: Partial<EnrollmentFormData>) => void
  courses: Course[]
  agreedError?: string
  onJumpTo: (step: number) => void
}

export function Step3Confirm({ state, set, courses, agreedError, onJumpTo }: Props) {
  const [showTerms, setShowTerms] = useState(false)
  const course = courses.find(c => c.id === state.courseId)
  const isGroup = state.type === 'group'
  const total = isGroup
    ? (course?.price ?? 0) * (state.headCount ?? 1)
    : course?.price ?? 0

  return (
    <>
      <div>
        <h1 className="text-[26px] leading-tight tracking-[-0.025em] font-bold mb-2 text-ink-1">
          신청 내용을 마지막으로 확인해주세요.
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-3 m-0 tracking-tight">
          잘못된 정보가 있다면 바로 수정할 수 있어요.
        </p>
      </div>

      <SectionCard>
        <SectionHeader title="강의 정보" onEdit={() => onJumpTo(1)} />
        {course && (
          <div className="px-5 py-4">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold tracking-[-0.02em] text-ink-1 truncate">
                {course.title}
              </div>
              <div className="text-xs text-ink-3 mt-0.5 tracking-tight">
                {course.instructor} · {formatDate(course.startDate)}
              </div>
            </div>
          </div>
        )}
        <div className="px-5 py-3 border-t border-ink-5 flex justify-between items-baseline">
          <div className="text-sm text-ink-3 tracking-tight">
            {isGroup ? `${state.headCount ?? 1}명 · 단체 신청` : '개인 신청'}
          </div>
          <div className="text-lg font-bold tracking-[-0.02em] tabular-nums text-ink-1">
            {formatPrice(total)}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader title={isGroup ? '담당자 정보' : '신청자 정보'} onEdit={() => onJumpTo(2)} />
        <DataRow label="이름">{state.name || '—'}</DataRow>
        <DataRow label="이메일" last>{state.email || '—'}</DataRow>
      </SectionCard>

      {isGroup && (
        <SectionCard>
          <SectionHeader title="단체 정보" onEdit={() => onJumpTo(2)} />
          <DataRow label="단체명">{state.organizationName || '—'}</DataRow>
          <DataRow label="인원">{state.headCount}명</DataRow>
          <div className="px-5 py-3">
            <div className="text-xs text-ink-3 mb-2 tracking-tight">참가자</div>
            <div className="flex flex-col gap-1">
              {(state.participants ?? []).map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm text-ink-2 tracking-tight"
                >
                  <span>
                    {i + 1}. {p.name || '이름 미입력'}
                  </span>
                  <span className="text-ink-3">{p.email || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      )}

      {state.motivation && (
        <SectionCard>
          <SectionHeader title="수강 동기" onEdit={() => onJumpTo(2)} />
          <div className="px-5 py-4 text-sm text-ink-2 leading-[1.55] tracking-tight whitespace-pre-wrap">
            {state.motivation}
          </div>
        </SectionCard>
      )}

      <div className="mt-1">
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all',
            state.agreed ? 'border-brand bg-brand-soft' : 'border-ink-5 bg-white',
            agreedError ? 'border-danger bg-danger-soft' : ''
          )}
          onClick={() => set({ agreed: !state.agreed })}
        >
          <div
            className={cn(
              'w-[22px] h-[22px] rounded-[7px] border-[1.5px] grid place-items-center flex-shrink-0 transition-all mt-0.5',
              state.agreed ? 'bg-brand border-brand' : 'bg-white border-ink-4'
            )}
          >
            <IconCheck className={cn(state.agreed ? 'text-white' : 'text-transparent')} />
          </div>
          <div className="text-sm leading-relaxed text-ink-2 tracking-tight flex-1">
            <b className="font-semibold text-ink-1">이용약관 및 개인정보 처리방침</b>에 동의합니다.
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setShowTerms(true) }}
              className="text-brand text-xs font-medium ml-1 underline underline-offset-2 cursor-pointer bg-transparent border-none p-0"
            >
              자세히
            </button>
          </div>
        </div>
        {agreedError && (
          <div className="flex items-center gap-1 text-xs text-danger font-medium px-3.5 pt-2 tracking-tight">
            <IconAlertSm /> {agreedError}
          </div>
        )}
      </div>

      {showTerms && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowTerms(false)}
        >
          <div
            className="w-full max-w-[600px] bg-white rounded-t-[28px] max-h-[80dvh] flex flex-col animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-5 flex-shrink-0">
              <h2 className="text-base font-bold text-ink-1 tracking-tight">이용약관 및 개인정보 처리방침</h2>
              <button
                type="button"
                onClick={() => setShowTerms(false)}
                className="bg-transparent border-none p-1.5 cursor-pointer text-ink-3 hover:text-ink-1 transition-colors"
                aria-label="닫기"
              >
                <IconX />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 flex flex-col gap-6 text-sm text-ink-2 leading-relaxed tracking-tight">
              <section>
                <h3 className="text-sm font-bold text-ink-1 mb-2">제1조 (목적)</h3>
                <p>{'본 약관은 수강 신청 서비스(이하 "서비스")를 이용함에 있어 서비스 제공자와 이용자 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.'}</p>
              </section>
              <section>
                <h3 className="text-sm font-bold text-ink-1 mb-2">제2조 (서비스 이용)</h3>
                <p>이용자는 본 약관에 동의함으로써 수강 신청 및 관련 서비스를 이용할 수 있습니다. 서비스 제공자는 안정적인 서비스 제공을 위해 최선을 다하며, 불가피한 사유로 서비스가 중단될 경우 사전 공지합니다.</p>
              </section>
              <section>
                <h3 className="text-sm font-bold text-ink-1 mb-2">제3조 (취소 및 환불)</h3>
                <p>수강 신청 후 강의 시작 7일 전까지 취소 시 전액 환불됩니다. 강의 시작 3일 전까지는 50% 환불, 이후에는 환불이 불가합니다. 환불은 신청일로부터 5영업일 이내에 처리됩니다.</p>
              </section>
              <section>
                <h3 className="text-sm font-bold text-ink-1 mb-2">개인정보 수집 및 이용 동의</h3>
                <p className="mb-2">서비스는 수강 신청 처리를 위해 아래 개인정보를 수집합니다.</p>
                <ul className="list-disc list-inside flex flex-col gap-1 text-ink-3">
                  <li>수집 항목: 이름, 이메일 주소</li>
                  <li>수집 목적: 수강 신청 확인 및 안내 발송</li>
                  <li>보유 기간: 수강 종료 후 1년</li>
                </ul>
              </section>
              <section>
                <h3 className="text-sm font-bold text-ink-1 mb-2">제3자 제공</h3>
                <p>수집된 개인정보는 법령에 따른 경우를 제외하고 제3자에게 제공되지 않습니다. 강의 운영을 위해 담당 강사에게 이름과 이메일이 공유될 수 있습니다.</p>
              </section>
            </div>

            <div className="px-5 py-4 border-t border-ink-5 flex-shrink-0">
              <Button
                onClick={() => { set({ agreed: true }); setShowTerms(false) }}
                className="w-full h-12 text-sm"
              >
                동의하고 닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
