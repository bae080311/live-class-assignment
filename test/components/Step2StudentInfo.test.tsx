import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Step2StudentInfo } from '@/components/enrollment/Step2StudentInfo'
import type { EnrollmentFormData, RHFData } from '@/lib/schemas/enrollment'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'

function makeRegister(): UseFormRegister<RHFData> {
  return ((name: string) => ({
    name,
    ref: vi.fn(),
    onChange: vi.fn(),
    onBlur: vi.fn(),
  })) as unknown as UseFormRegister<RHFData>
}

function renderStep2(
  state: Partial<EnrollmentFormData> = { type: 'personal', name: '', email: '' },
  set = vi.fn(),
  errors: FieldErrors<RHFData> = {}
) {
  return render(
    <Step2StudentInfo
      state={state}
      set={set}
      register={makeRegister()}
      errors={errors}
    />
  )
}

describe('Step2StudentInfo', () => {
  describe('개인 신청', () => {
    it('개인 신청 제목이 표시됨', () => {
      renderStep2()
      expect(screen.getByText('수강생 정보를 알려주세요.')).toBeInTheDocument()
    })

    it('이름, 이메일 필드가 렌더링됨', () => {
      renderStep2()
      expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    })

    it('수강 동기 선택 필드가 렌더링됨', () => {
      renderStep2()
      expect(screen.getByText('수강 동기')).toBeInTheDocument()
      expect(screen.getByText('선택')).toBeInTheDocument()
    })

    it('단체 관련 필드가 표시되지 않음', () => {
      renderStep2()
      expect(screen.queryByText('단체 정보')).not.toBeInTheDocument()
      expect(screen.queryByText('단체명')).not.toBeInTheDocument()
    })

    it('개인정보 보호 안내 문구가 표시됨', () => {
      renderStep2()
      expect(screen.getByText(/입력한 정보는 안전하게 보관되며/)).toBeInTheDocument()
    })
  })

  describe('단체 신청', () => {
    const groupState: Partial<EnrollmentFormData> = {
      type: 'group',
      name: '',
      email: '',
      headCount: 2,
      participants: [
        { name: '', email: '' },
        { name: '', email: '' },
      ],
    }

    it('단체 신청 제목이 표시됨', () => {
      renderStep2(groupState)
      expect(screen.getByText('신청 정보를 알려주세요.')).toBeInTheDocument()
    })

    it('단체 정보 섹션이 표시됨', () => {
      renderStep2(groupState)
      expect(screen.getByText('단체 정보')).toBeInTheDocument()
      expect(screen.getByText('단체명')).toBeInTheDocument()
      expect(screen.getByText('신청 인원수')).toBeInTheDocument()
      expect(screen.getByText('담당자 연락처')).toBeInTheDocument()
    })

    it('참가자 명단이 headCount만큼 표시됨', () => {
      renderStep2(groupState)
      expect(screen.getByText('참가자 1')).toBeInTheDocument()
      expect(screen.getByText('참가자 2')).toBeInTheDocument()
      expect(screen.queryByText('참가자 3')).not.toBeInTheDocument()
    })

    it('스테퍼 + 버튼 클릭 시 인원 증가하고 set 호출', () => {
      const set = vi.fn()
      renderStep2(groupState, set)
      // 스테퍼: 마이너스(disabled, value=2=min), 플러스(enabled)
      const stepperButtons = screen.getAllByRole('button').filter(
        b => b.getAttribute('type') === 'button'
      )
      fireEvent.click(stepperButtons[1])
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ headCount: 3 })
      )
    })

    it('스테퍼 - 버튼은 최솟값(2)에서 비활성화됨', () => {
      renderStep2(groupState)
      const stepperButtons = screen.getAllByRole('button').filter(
        b => b.getAttribute('type') === 'button'
      )
      expect(stepperButtons[0]).toBeDisabled()
    })

    it('스테퍼 - 버튼 클릭 시 인원 감소하고 set 호출', () => {
      const set = vi.fn()
      const stateWith3 = {
        ...groupState,
        headCount: 3,
        participants: [
          { name: '참가자1', email: 'p1@example.com' },
          { name: '참가자2', email: 'p2@example.com' },
          { name: '참가자3', email: 'p3@example.com' },
        ],
      }
      renderStep2(stateWith3, set)
      const stepperButtons = screen.getAllByRole('button').filter(
        b => b.getAttribute('type') === 'button'
      )
      fireEvent.click(stepperButtons[0])
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ headCount: 2 })
      )
    })

    it('스테퍼 + 버튼은 최댓값(10)에서 비활성화됨', () => {
      const stateWith10 = {
        ...groupState,
        headCount: 10,
        participants: Array.from({ length: 10 }, (_, i) => ({
          name: `참가자${i + 1}`,
          email: `p${i + 1}@example.com`,
        })),
      }
      renderStep2(stateWith10)
      const stepperButtons = screen.getAllByRole('button').filter(
        b => b.getAttribute('type') === 'button'
      )
      expect(stepperButtons[1]).toBeDisabled()
    })

    it('참가자 이름 입력 시 set 호출', () => {
      const set = vi.fn()
      renderStep2(groupState, set)
      const nameInputs = screen.getAllByPlaceholderText('이름')
      fireEvent.change(nameInputs[0], { target: { value: '홍길동' } })
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({ name: '홍길동' }),
          ]),
        })
      )
    })

    it('참가자 이메일 입력 시 set 호출', () => {
      const set = vi.fn()
      renderStep2(groupState, set)
      const emailInputs = screen.getAllByPlaceholderText('이메일')
      fireEvent.change(emailInputs[0], { target: { value: 'hong@test.com' } })
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({ email: 'hong@test.com' }),
          ]),
        })
      )
    })
  })

  describe('에러 표시', () => {
    it('이름 에러가 표시됨', () => {
      renderStep2(
        { type: 'personal', name: '', email: '' },
        vi.fn(),
        { name: { message: '이름은 2자 이상이어야 해요.', type: 'min' } }
      )
      expect(screen.getByText('이름은 2자 이상이어야 해요.')).toBeInTheDocument()
    })

    it('이메일 에러가 표시됨', () => {
      renderStep2(
        { type: 'personal', name: '홍길동', email: 'invalid' },
        vi.fn(),
        { email: { message: '이메일 형식이 올바르지 않아요.', type: 'email' } }
      )
      expect(screen.getByText('이메일 형식이 올바르지 않아요.')).toBeInTheDocument()
    })
  })

  describe('수강 동기 카운터', () => {
    it('동기 텍스트 길이가 카운터에 표시됨', () => {
      renderStep2({ type: 'personal', name: '', email: '', motivation: '안녕하세요' })
      expect(screen.getByText('5 / 300')).toBeInTheDocument()
    })

    it('동기 미입력 시 0으로 표시됨', () => {
      renderStep2()
      expect(screen.getByText('0 / 300')).toBeInTheDocument()
    })
  })
})
