import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultSuccess } from '@/components/enrollment/ResultSuccess'
import type { Course } from '@/lib/schemas/enrollment'

const mockCourse: Course = {
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
}

const defaultProps = {
  state: { courseId: 'c1', name: '홍길동', type: 'personal' as const },
  enrollmentId: 'ENR-001',
  courses: [mockCourse],
  onReset: vi.fn(),
}

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  return writeText
}

describe('ResultSuccess — 기본 렌더링', () => {
  it('신청 번호가 표시됨', () => {
    render(<ResultSuccess {...defaultProps} />)
    expect(screen.getByText('ENR-001')).toBeInTheDocument()
  })

  it('강의명이 표시됨', () => {
    render(<ResultSuccess {...defaultProps} />)
    expect(screen.getByText('UX 라이팅 실전')).toBeInTheDocument()
  })

  it('처음으로 돌아가기 클릭 시 onReset 호출', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<ResultSuccess {...defaultProps} onReset={onReset} />)
    await user.click(screen.getByText('처음으로 돌아가기'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})

describe('ResultSuccess — 복사 토스트', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('복사 버튼 클릭 시 토스트가 표시됨', async () => {
    stubClipboard()
    render(<ResultSuccess {...defaultProps} />)

    await act(async () => {
      fireEvent.click(screen.getByLabelText('복사'))
    })

    expect(screen.getByText('신청 번호가 복사됐어요')).toBeInTheDocument()
  })

  it('clipboard에 신청 번호가 복사됨', async () => {
    const writeText = stubClipboard()
    render(<ResultSuccess {...defaultProps} />)

    await act(async () => {
      fireEvent.click(screen.getByLabelText('복사'))
    })

    expect(writeText).toHaveBeenCalledWith('ENR-001')
  })

  it('토스트는 2초 이전엔 유지됨', async () => {
    stubClipboard()
    render(<ResultSuccess {...defaultProps} />)

    await act(async () => {
      fireEvent.click(screen.getByLabelText('복사'))
    })

    act(() => { vi.advanceTimersByTime(1999) })

    expect(screen.getByText('신청 번호가 복사됐어요')).toBeInTheDocument()
  })

  it('토스트가 2초 후 사라짐', async () => {
    stubClipboard()
    render(<ResultSuccess {...defaultProps} />)

    await act(async () => {
      fireEvent.click(screen.getByLabelText('복사'))
    })

    await act(async () => { vi.advanceTimersByTime(2000) })

    expect(screen.queryByText('신청 번호가 복사됐어요')).not.toBeInTheDocument()
  })
})
