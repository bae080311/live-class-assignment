import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useParticipantList } from '@/lib/hooks/useParticipantList'

describe('useParticipantList', () => {
  const makeParticipants = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ name: `참가자${i + 1}`, email: `p${i + 1}@example.com` }))

  it('resize로 참가자 수를 늘린다', () => {
    const set = vi.fn()
    const { result } = renderHook(() =>
      useParticipantList(makeParticipants(2), set)
    )
    act(() => {
      result.current.resize(4)
    })
    expect(set).toHaveBeenCalledWith({
      headCount: 4,
      participants: expect.arrayContaining([
        { name: '참가자1', email: 'p1@example.com' },
        { name: '참가자2', email: 'p2@example.com' },
        { name: '', email: '' },
        { name: '', email: '' },
      ]),
    })
    const call = set.mock.calls[0][0]
    expect(call.participants).toHaveLength(4)
  })

  it('resize로 참가자 수를 줄인다', () => {
    const set = vi.fn()
    const { result } = renderHook(() =>
      useParticipantList(makeParticipants(4), set)
    )
    act(() => {
      result.current.resize(2)
    })
    const call = set.mock.calls[0][0]
    expect(call.headCount).toBe(2)
    expect(call.participants).toHaveLength(2)
    expect(call.participants[0].name).toBe('참가자1')
  })

  it('updateField로 참가자 이름을 업데이트한다', () => {
    const set = vi.fn()
    const { result } = renderHook(() =>
      useParticipantList(makeParticipants(2), set)
    )
    act(() => {
      result.current.updateField(0, 'name', '새이름')
    })
    expect(set).toHaveBeenCalledWith({
      participants: expect.arrayContaining([
        { name: '새이름', email: 'p1@example.com' },
        { name: '참가자2', email: 'p2@example.com' },
      ]),
    })
  })

  it('updateField로 참가자 이메일을 업데이트한다', () => {
    const set = vi.fn()
    const { result } = renderHook(() =>
      useParticipantList(makeParticipants(2), set)
    )
    act(() => {
      result.current.updateField(1, 'email', 'new@example.com')
    })
    const call = set.mock.calls[0][0]
    expect(call.participants[1].email).toBe('new@example.com')
    expect(call.participants[0]).toEqual({ name: '참가자1', email: 'p1@example.com' })
  })

  it('participants가 undefined일 때 resize가 빈 배열에서 시작한다', () => {
    const set = vi.fn()
    const { result } = renderHook(() => useParticipantList(undefined, set))
    act(() => {
      result.current.resize(2)
    })
    const call = set.mock.calls[0][0]
    expect(call.headCount).toBe(2)
    expect(call.participants).toHaveLength(2)
    expect(call.participants[0]).toEqual({ name: '', email: '' })
  })

  it('participants가 undefined일 때 updateField가 새 배열에서 업데이트한다', () => {
    const set = vi.fn()
    const { result } = renderHook(() => useParticipantList(undefined, set))
    act(() => {
      result.current.updateField(0, 'name', '이름')
    })
    const call = set.mock.calls[0][0]
    expect(call.participants[0].name).toBe('이름')
  })

  it('원본 participants 배열을 변이시키지 않는다', () => {
    const original = makeParticipants(2)
    const originalSnapshot = original.map(p => ({ ...p }))
    const set = vi.fn()
    const { result } = renderHook(() => useParticipantList(original, set))
    act(() => {
      result.current.updateField(0, 'name', '변경됨')
    })
    expect(original[0].name).toBe(originalSnapshot[0].name)
  })
})
