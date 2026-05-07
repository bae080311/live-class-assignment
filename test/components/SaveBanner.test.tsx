import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { SaveBanner, RecoverBanner } from '@/components/enrollment/SaveBanner'

describe('SaveBanner', () => {
  it('saved 상태에서 "자동 저장됨" 텍스트가 표시됨', () => {
    render(<SaveBanner state="saved" />)
    expect(screen.getByText('자동 저장됨')).toBeInTheDocument()
  })

  it('saving 상태에서 "자동 저장됨" 텍스트가 표시됨', () => {
    render(<SaveBanner state="saving" />)
    expect(screen.getByText('자동 저장됨')).toBeInTheDocument()
  })

  it('fail 상태에서 저장 실패 안내 메시지가 표시됨', () => {
    render(<SaveBanner state="fail" />)
    expect(screen.getByText(/자동 저장이 잠시 멈췄어요/)).toBeInTheDocument()
  })

  it('fail 상태에서 "자동 저장됨" 텍스트가 표시되지 않음', () => {
    render(<SaveBanner state="fail" />)
    expect(screen.queryByText('자동 저장됨')).not.toBeInTheDocument()
  })

  it('saved 상태에서 실패 메시지가 표시되지 않음', () => {
    render(<SaveBanner state="saved" />)
    expect(screen.queryByText(/잠시 멈췄어요/)).not.toBeInTheDocument()
  })
})

describe('RecoverBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('복구 안내 메시지가 표시됨', () => {
    render(<RecoverBanner onRecover={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText(/이전에 작성하던 내용이 있어요/)).toBeInTheDocument()
  })

  it('"이어서 작성" 버튼이 표시됨', () => {
    render(<RecoverBanner onRecover={vi.fn()} onDismiss={vi.fn()} />)
    expect(screen.getByText('이어서 작성')).toBeInTheDocument()
  })

  it('"이어서 작성" 클릭 시 onRecover 호출', () => {
    const onRecover = vi.fn()
    render(<RecoverBanner onRecover={onRecover} onDismiss={vi.fn()} />)
    fireEvent.click(screen.getByText('이어서 작성'))
    expect(onRecover).toHaveBeenCalledTimes(1)
  })

  it('닫기(X) 버튼 클릭 시 onDismiss 호출', () => {
    const onDismiss = vi.fn()
    render(<RecoverBanner onRecover={vi.fn()} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByLabelText('닫기'))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('8초 후 onDismiss가 자동 호출됨', () => {
    const onDismiss = vi.fn()
    render(<RecoverBanner onRecover={vi.fn()} onDismiss={onDismiss} />)
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(8000) })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('8초 미만에서는 onDismiss가 호출되지 않음', () => {
    const onDismiss = vi.fn()
    render(<RecoverBanner onRecover={vi.fn()} onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(7999) })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('언마운트 시 타이머가 정리됨 (onDismiss 미호출)', () => {
    const onDismiss = vi.fn()
    const { unmount } = render(<RecoverBanner onRecover={vi.fn()} onDismiss={onDismiss} />)
    unmount()
    act(() => { vi.advanceTimersByTime(8000) })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
