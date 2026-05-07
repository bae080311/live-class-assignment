import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Step3Confirm } from '@/components/enrollment/Step3Confirm'
import type { Course, EnrollmentFormData } from '@/lib/schemas/enrollment'

const mockCourses: Course[] = [
  {
    id: 'c1',
    category: 'design',
    title: 'UX 라이팅 실전',
    instructor: '김유나',
    description: '실무 UX',
    maxCapacity: 20,
    currentEnrollment: 12,
    startDate: '2026-06-10T09:00:00+09:00',
    endDate: '2026-06-10T13:00:00+09:00',
    price: 89000,
    thumb: 'thumb-1',
    initial: 'UX',
  },
]

const personalState: Partial<EnrollmentFormData> = {
  courseId: 'c1',
  type: 'personal',
  name: '홍길동',
  email: 'hong@example.com',
  agreed: false,
}

const groupState: Partial<EnrollmentFormData> = {
  courseId: 'c1',
  type: 'group',
  name: '김담당',
  email: 'kim@example.com',
  organizationName: '디자인팀',
  headCount: 3,
  participants: [
    { name: '참가자1', email: 'p1@example.com' },
    { name: '참가자2', email: 'p2@example.com' },
    { name: '참가자3', email: 'p3@example.com' },
  ],
  agreed: false,
}

function renderStep3(
  state: Partial<EnrollmentFormData> = personalState,
  set = vi.fn(),
  onJumpTo = vi.fn(),
  agreedError?: string
) {
  return render(
    <Step3Confirm
      state={state}
      set={set}
      courses={mockCourses}
      agreedError={agreedError}
      onJumpTo={onJumpTo}
    />
  )
}

describe('Step3Confirm', () => {
  describe('강의 정보 섹션', () => {
    it('강의 제목이 표시됨', () => {
      renderStep3()
      expect(screen.getByText('UX 라이팅 실전')).toBeInTheDocument()
    })

    it('강사 이름이 표시됨', () => {
      renderStep3()
      expect(screen.getByText(/김유나/)).toBeInTheDocument()
    })

    it('개인 신청 가격이 표시됨', () => {
      renderStep3()
      expect(screen.getByText('89,000원')).toBeInTheDocument()
    })

    it('강의 수정 버튼 클릭 시 onJumpTo(1) 호출', () => {
      const onJumpTo = vi.fn()
      renderStep3(personalState, vi.fn(), onJumpTo)
      const editButtons = screen.getAllByText('수정')
      fireEvent.click(editButtons[0])
      expect(onJumpTo).toHaveBeenCalledWith(1)
    })
  })

  describe('개인 신청자 정보', () => {
    it('신청자 이름이 표시됨', () => {
      renderStep3()
      expect(screen.getByText('홍길동')).toBeInTheDocument()
    })

    it('신청자 이메일이 표시됨', () => {
      renderStep3()
      expect(screen.getByText('hong@example.com')).toBeInTheDocument()
    })

    it('"신청자 정보" 레이블이 표시됨', () => {
      renderStep3()
      expect(screen.getByText('신청자 정보')).toBeInTheDocument()
    })

    it('단체 정보 섹션이 표시되지 않음', () => {
      renderStep3()
      expect(screen.queryByText('단체 정보')).not.toBeInTheDocument()
    })
  })

  describe('단체 신청자 정보', () => {
    it('"담당자 정보" 레이블이 표시됨', () => {
      renderStep3(groupState)
      expect(screen.getByText('담당자 정보')).toBeInTheDocument()
    })

    it('단체명이 표시됨', () => {
      renderStep3(groupState)
      expect(screen.getByText('디자인팀')).toBeInTheDocument()
    })

    it('인원수가 표시됨', () => {
      renderStep3(groupState)
      expect(screen.getByText('3명')).toBeInTheDocument()
    })

    it('참가자 목록이 표시됨', () => {
      renderStep3(groupState)
      expect(screen.getByText(/참가자1/)).toBeInTheDocument()
      expect(screen.getByText(/참가자2/)).toBeInTheDocument()
      expect(screen.getByText(/참가자3/)).toBeInTheDocument()
    })

    it('단체 신청 총액이 인원 × 가격으로 표시됨', () => {
      renderStep3(groupState)
      // 3명 × 89,000원 = 267,000원
      expect(screen.getByText('267,000원')).toBeInTheDocument()
    })
  })

  describe('약관 동의', () => {
    it('약관 동의 체크박스가 표시됨', () => {
      renderStep3()
      expect(screen.getByText(/이용약관 및 개인정보 처리방침/)).toBeInTheDocument()
    })

    it('약관 클릭 시 set 호출', () => {
      const set = vi.fn()
      renderStep3({ ...personalState, agreed: false }, set)
      fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
      expect(set).toHaveBeenCalledWith({ agreed: true })
    })

    it('동의 상태에서 클릭 시 해제', () => {
      const set = vi.fn()
      renderStep3({ ...personalState, agreed: true }, set)
      fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
      expect(set).toHaveBeenCalledWith({ agreed: false })
    })

    it('agreedError가 있으면 에러 메시지 표시', () => {
      renderStep3(personalState, vi.fn(), vi.fn(), '약관 동의가 필요해요.')
      expect(screen.getByText('약관 동의가 필요해요.')).toBeInTheDocument()
    })

    it('agreedError가 없으면 에러 메시지 미표시', () => {
      renderStep3()
      expect(screen.queryByText('약관 동의가 필요해요.')).not.toBeInTheDocument()
    })
  })

  describe('수강 동기', () => {
    it('동기가 있으면 표시됨', () => {
      renderStep3({ ...personalState, motivation: '배우고 싶어서요.' })
      expect(screen.getByText('배우고 싶어서요.')).toBeInTheDocument()
    })

    it('동기가 없으면 섹션 미표시', () => {
      renderStep3()
      expect(screen.queryByText('수강 동기')).not.toBeInTheDocument()
    })

    it('수강 동기 수정 버튼 클릭 시 onJumpTo(2) 호출', () => {
      const onJumpTo = vi.fn()
      renderStep3({ ...personalState, motivation: '배우고 싶어서요.' }, vi.fn(), onJumpTo)
      const editButtons = screen.getAllByText('수정')
      // 강의 정보(1), 신청자 정보(2), 수강 동기(3) 순서
      fireEvent.click(editButtons[2])
      expect(onJumpTo).toHaveBeenCalledWith(2)
    })
  })

  describe('단체 신청 수정 버튼', () => {
    it('단체 정보 수정 버튼 클릭 시 onJumpTo(2) 호출', () => {
      const onJumpTo = vi.fn()
      renderStep3(groupState, vi.fn(), onJumpTo)
      const editButtons = screen.getAllByText('수정')
      // 강의 정보(1), 담당자 정보(2), 단체 정보(3) 순서
      fireEvent.click(editButtons[2])
      expect(onJumpTo).toHaveBeenCalledWith(2)
    })
  })

  describe('약관 모달', () => {
    it('"자세히" 버튼 클릭 시 모달이 열림', async () => {
      const user = userEvent.setup()
      renderStep3()
      expect(screen.queryByText('동의하고 닫기')).not.toBeInTheDocument()
      await user.click(screen.getByText('자세히'))
      await waitFor(() => {
        expect(screen.getByText('동의하고 닫기')).toBeInTheDocument()
      })
    })

    it('닫기(X) 버튼 클릭 시 모달이 닫힘', async () => {
      const user = userEvent.setup()
      renderStep3()
      await user.click(screen.getByText('자세히'))
      await waitFor(() => screen.getByLabelText('닫기'))
      await user.click(screen.getByLabelText('닫기'))
      await waitFor(() => {
        expect(screen.queryByText('동의하고 닫기')).not.toBeInTheDocument()
      })
    })

    it('"동의하고 닫기" 클릭 시 set({ agreed: true }) 호출 후 모달 닫힘', async () => {
      const set = vi.fn()
      const user = userEvent.setup()
      renderStep3(personalState, set)
      await user.click(screen.getByText('자세히'))
      await waitFor(() => screen.getByText('동의하고 닫기'))
      await user.click(screen.getByText('동의하고 닫기'))
      expect(set).toHaveBeenCalledWith({ agreed: true })
      await waitFor(() => {
        expect(screen.queryByText('동의하고 닫기')).not.toBeInTheDocument()
      })
    })

    it('모달 오버레이 클릭 시 모달이 닫힘', async () => {
      const user = userEvent.setup()
      renderStep3()
      await user.click(screen.getByText('자세히'))
      await waitFor(() => screen.getByText('동의하고 닫기'))
      // 오버레이(배경) 클릭 — 모달 내부가 아닌 backdrop 영역
      const backdrop = document.querySelector('.fixed.inset-0') as HTMLElement
      fireEvent.click(backdrop)
      await waitFor(() => {
        expect(screen.queryByText('동의하고 닫기')).not.toBeInTheDocument()
      })
    })
  })
})
