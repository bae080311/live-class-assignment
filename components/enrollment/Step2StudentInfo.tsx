'use client'

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { EnrollmentFormData, RHFData } from '@/lib/schemas/enrollment'
import { IconAlertSm, IconPlus, IconMinus } from '@/assets/svg'
import { Input, Textarea } from './Input'
import { useParticipantList } from '@/lib/hooks/useParticipantList'

type ParticipantError = { name?: string; email?: string }

type Props = {
  state: Partial<EnrollmentFormData>
  set: (patch: Partial<EnrollmentFormData>) => void
  register: UseFormRegister<RHFData>
  errors: FieldErrors<RHFData>
  rhfValues?: Record<string, unknown>
  participantErrors?: ParticipantError[]
}

function Field({
  label,
  required,
  optional,
  error,
  hint,
  counter,
  children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  hint?: string
  counter?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5 mt-3.5 first:mt-0">
      <div className="flex items-center gap-1.5 text-sm font-medium text-ink-3 tracking-tight pl-0.5">
        {label}
        {required && <span className="text-danger font-semibold">*</span>}
        {optional && (
          <span className="text-[11px] font-medium text-ink-4 bg-ink-5/50 px-1.5 py-0.5 rounded">
            선택
          </span>
        )}
      </div>
      {children}
      {(error || counter || hint) && (
        <div className="flex justify-between gap-2 text-xs px-1 tracking-tight">
          {error ? (
            <span className="flex items-center gap-1 text-danger font-medium">
              <IconAlertSm /> {error}
            </span>
          ) : hint ? (
            <span className="text-ink-4">{hint}</span>
          ) : (
            <span />
          )}
          {counter && <span className="text-ink-4 tabular-nums ml-auto">{counter}</span>}
        </div>
      )}
    </div>
  )
}

function Stepper({
  value,
  onChange,
  min = 2,
  max = 10,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="inline-flex items-center gap-0 bg-white border border-ink-5 rounded-full px-1 py-1">
      <button
        type="button"
        className="w-9 h-9 rounded-full border-none bg-transparent text-ink-2 text-lg cursor-pointer grid place-items-center hover:bg-ink-5/50 disabled:text-ink-5 disabled:cursor-not-allowed disabled:bg-transparent transition-colors"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <IconMinus />
      </button>
      <div className="w-9 text-center font-semibold text-ink-1 text-base tracking-tight tabular-nums">
        {value}
      </div>
      <button
        type="button"
        className="w-9 h-9 rounded-full border-none bg-transparent text-ink-2 text-lg cursor-pointer grid place-items-center hover:bg-ink-5/50 disabled:text-ink-5 disabled:cursor-not-allowed disabled:bg-transparent transition-colors"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <IconPlus />
      </button>
    </div>
  )
}

export function Step2StudentInfo({ state, set, register, errors, rhfValues, participantErrors = [] }: Props) {
  const isGroup = state.type === 'group'
  const motivation = (rhfValues?.motivation as string | undefined) ?? state.motivation ?? ''
  const { resize, updateField } = useParticipantList(state.participants, set)

  return (
    <>
      <div>
        <h1 className="text-[26px] leading-tight tracking-[-0.025em] font-bold mb-2 text-ink-1">
          {isGroup ? '신청 정보를 알려주세요.' : '수강생 정보를 알려주세요.'}
        </h1>
        <p className="text-[15px] leading-relaxed text-ink-3 m-0 tracking-tight">
          신청 확인에 필요한 정보만 받을게요.
        </p>
      </div>

      <div className="bg-white rounded-xl p-5 border border-ink-5">
        <Field label="이름" required error={errors.name?.message}>
          <Input
            {...register('name')}
            hasError={!!errors.name}
            filled={Boolean((rhfValues?.name as string | undefined) ?? state.name)}
            placeholder="홍길동"
          />
        </Field>
        <Field
          label="이메일"
          required
          error={errors.email?.message}
          hint={!errors.email ? '신청 결과를 이 메일로 보내드려요' : undefined}
        >
          <Input
            {...register('email')}
            hasError={!!errors.email}
            filled={Boolean((rhfValues?.email as string | undefined) ?? state.email)}
            placeholder="you@example.com"
            inputMode="email"
          />
        </Field>
        <Field
          label="전화번호"
          required
          error={errors.phone?.message}
          hint={!errors.phone ? '신청 관련 연락에 사용돼요' : undefined}
        >
          <Input
            {...register('phone')}
            hasError={!!errors.phone}
            filled={Boolean((rhfValues?.phone as string | undefined) ?? state.phone)}
            placeholder="01012345678"
            inputMode="tel"
          />
        </Field>

        <Field
          label="수강 동기"
          optional
          counter={`${motivation.length} / 300`}
          hint="편하게 적어주세요. 강사님이 꼭 읽어요."
        >
          <Textarea
            {...register('motivation')}
            rows={4}
            placeholder="이 강의를 통해 어떤 점이 궁금하신가요?"
            maxLength={300}
          />
        </Field>
      </div>

      {isGroup && (
        <>
          <div className="flex items-baseline justify-between text-sm font-semibold tracking-[-0.02em] text-ink-2 mb-2 mx-0.5">
            단체 정보
            <span className="text-xs font-medium text-ink-4 tracking-tight">
              함께 수강할 분들의 정보를 알려주세요
            </span>
          </div>
          <div className="bg-white rounded-xl p-5 border border-ink-5">
            <Field label="단체명" required error={errors.organizationName?.message}>
              <Input
                {...register('organizationName')}
                hasError={!!errors.organizationName}
                filled={Boolean((rhfValues?.organizationName as string | undefined) ?? state.organizationName)}
                placeholder="예: 디자인팀, OO기업"
              />
            </Field>
            <Field label="신청 인원수" required>
              <Stepper
                value={state.headCount ?? 2}
                onChange={resize}
              />
            </Field>
            <Field
              label="담당자 연락처"
              required
              error={errors.contactPerson?.message}
              hint={!errors.contactPerson ? '신청 관련 안내를 받을 분의 연락처예요' : undefined}
            >
              <Input
                {...register('contactPerson')}
                hasError={!!errors.contactPerson}
                filled={Boolean((rhfValues?.contactPerson as string | undefined) ?? state.contactPerson)}
                placeholder="이메일 또는 전화번호"
              />
            </Field>
          </div>

          <div className="flex items-baseline justify-between text-sm font-semibold tracking-[-0.02em] text-ink-2 mb-2 mx-0.5">
            참가자 명단
            <span className="text-xs font-medium text-ink-4 tracking-tight">
              {state.headCount ?? 2}명
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {(state.participants ?? Array.from({ length: state.headCount ?? 2 }, () => ({ name: '', email: '' }))).map((p, i) => {
              const pErr = participantErrors[i] ?? {}
              return (
                <div key={i} className="p-4 rounded-xl border border-ink-5 flex flex-col gap-3 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2 tracking-tight">
                      <span className="w-[22px] h-[22px] rounded-full bg-brand text-white grid place-items-center text-[11px] font-bold">
                        {i + 1}
                      </span>
                      참가자 {i + 1}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <Input
                        variant="compact"
                        hasError={!!pErr.name}
                        placeholder="이름"
                        value={p.name}
                        onChange={e => updateField(i, 'name', e.target.value)}
                      />
                      {pErr.name && (
                        <span className="flex items-center gap-1 text-xs text-danger font-medium px-1">
                          <IconAlertSm /> {pErr.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Input
                        variant="compact"
                        hasError={!!pErr.email}
                        placeholder="이메일"
                        inputMode="email"
                        value={p.email}
                        onChange={e => updateField(i, 'email', e.target.value)}
                      />
                      {pErr.email && (
                        <span className="flex items-center gap-1 text-xs text-danger font-medium px-1">
                          <IconAlertSm /> {pErr.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {!isGroup && (
        <div className="text-xs text-ink-4 text-center px-2 tracking-tight">
          입력한 정보는 안전하게 보관되며 신청 외 목적으로 사용되지 않아요.
        </div>
      )}
    </>
  )
}
