import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyFeedback } from '@/lib/hooks/useCopyFeedback'

describe('useCopyFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('초기 상태에서 copied는 false다', () => {
    const { result } = renderHook(() => useCopyFeedback('test text'))
    expect(result.current.copied).toBe(false)
  })

  it('copy 호출 시 copied가 true가 된다', () => {
    const { result } = renderHook(() => useCopyFeedback('test text'))
    act(() => {
      result.current.copy()
    })
    expect(result.current.copied).toBe(true)
  })

  it('clipboard.writeText에 올바른 텍스트를 전달한다', () => {
    const { result } = renderHook(() => useCopyFeedback('복사할 텍스트'))
    act(() => {
      result.current.copy()
    })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('복사할 텍스트')
  })

  it('기본 duration(2000ms) 후 copied가 false로 초기화된다', () => {
    const { result } = renderHook(() => useCopyFeedback('test'))
    act(() => {
      result.current.copy()
    })
    expect(result.current.copied).toBe(true)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.copied).toBe(false)
  })

  it('커스텀 duration 후 copied가 false로 초기화된다', () => {
    const { result } = renderHook(() => useCopyFeedback('test', 1000))
    act(() => {
      result.current.copy()
    })
    act(() => {
      vi.advanceTimersByTime(999)
    })
    expect(result.current.copied).toBe(true)
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.copied).toBe(false)
  })

  it('clipboard 실패 시에도 copied는 true가 된다', () => {
    ;(navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('denied'))
    const { result } = renderHook(() => useCopyFeedback('test'))
    act(() => {
      result.current.copy()
    })
    expect(result.current.copied).toBe(true)
  })
})
