import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Step1CourseSelect } from '@/components/enrollment/Step1CourseSelect'
import type { Course, EnrollmentFormData } from '@/lib/schemas/enrollment'

const mockCourses: Course[] = [
  { id: 'c1', category: 'design', title: 'UX 라이팅 실전', instructor: '김유나', description: '실무 UX', maxCapacity: 20, currentEnrollment: 12, startDate: '2026-06-10T09:00:00+09:00', endDate: '2026-06-10T13:00:00+09:00', price: 89000 },
  { id: 'c2', category: 'design', title: '제품 사고와 디자인 시스템', instructor: '박재형', description: '디자인 시스템', maxCapacity: 15, currentEnrollment: 8, startDate: '2026-06-15T19:00:00+09:00', endDate: '2026-07-13T21:00:00+09:00', price: 129000 },
  { id: 'c3', category: 'development', title: 'React 깊이 있게 다루기', instructor: '이민서', description: 'React 고급', maxCapacity: 20, currentEnrollment: 20, startDate: '2026-06-22T10:00:00+09:00', endDate: '2026-07-13T12:00:00+09:00', price: 159000 },
]

function renderStep1(
  state: Partial<EnrollmentFormData> = { type: 'personal' },
  set = vi.fn(),
  showError = false,
  courses = mockCourses,
  isLoading = false
) {
  return render(
    <Step1CourseSelect
      state={state}
      set={set}
      showError={showError}
      courses={courses}
      isLoading={isLoading}
    />
  )
}

describe('Step1CourseSelect', () => {
  it('카테고리 칩이 모두 렌더링됨', () => {
    renderStep1()
    expect(screen.getByRole('tab', { name: '전체' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '디자인' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '개발' })).toBeInTheDocument()
  })

  it('강의 목록이 렌더링됨', () => {
    renderStep1()
    expect(screen.getByText('UX 라이팅 실전')).toBeInTheDocument()
    expect(screen.getByText('React 깊이 있게 다루기')).toBeInTheDocument()
  })

  it('isLoading=true이면 로딩 메시지 표시', () => {
    renderStep1({ type: 'personal' }, vi.fn(), false, [], true)
    expect(screen.getByText('강의를 불러오는 중...')).toBeInTheDocument()
  })

  it('카테고리 칩 클릭 시 해당 카테고리 강의만 표시', () => {
    renderStep1()
    fireEvent.click(screen.getByRole('tab', { name: '개발' }))
    expect(screen.getByText('React 깊이 있게 다루기')).toBeInTheDocument()
    expect(screen.queryByText('UX 라이팅 실전')).not.toBeInTheDocument()
  })

  it('강의 선택 시 set 콜백 호출', () => {
    const set = vi.fn()
    renderStep1({ type: 'personal' }, set)
    fireEvent.click(screen.getByText('UX 라이팅 실전').closest('[role="button"]')!)
    expect(set).toHaveBeenCalledWith({ courseId: 'c1' })
  })

  it('강의 선택 후 요약 배너 표시', () => {
    renderStep1({ type: 'personal', courseId: 'c1' })
    expect(screen.getByText('이 강의를 선택했어요')).toBeInTheDocument()
  })

  it('showError=true이고 강의 미선택 시 에러 배너 표시', () => {
    renderStep1({ type: 'personal' }, vi.fn(), true)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/강의를 먼저 선택해주세요/)).toBeInTheDocument()
  })

  it('강의 선택되면 에러 배너 숨김', () => {
    renderStep1({ type: 'personal', courseId: 'c1' }, vi.fn(), true)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('개인 신청 타입 버튼 클릭 시 set 호출', () => {
    const set = vi.fn()
    renderStep1({ type: 'group' }, set)
    fireEvent.click(screen.getByText('개인 신청').closest('button')!)
    expect(set).toHaveBeenCalledWith({ type: 'personal' })
  })

  it('단체 신청 타입 버튼 클릭 시 set 호출', () => {
    const set = vi.fn()
    renderStep1({ type: 'personal' }, set)
    fireEvent.click(screen.getByText('단체 신청').closest('button')!)
    expect(set).toHaveBeenCalledWith({ type: 'group' })
  })
})
