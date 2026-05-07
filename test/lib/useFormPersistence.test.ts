import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormPersistence } from '@/lib/hooks/useFormPersistence'
import type { EnrollmentFormData } from '@/lib/schemas/enrollment'

const baseLocal: Partial<EnrollmentFormData> = {
  courseId: 'c1',
  type: 'personal',
  name: '',
  email: '',
}

const emptyLocal: Partial<EnrollmentFormData> = {
  courseId: '',
  type: 'personal',
  name: '',
  email: '',
}

const baseRhf = { name: '홍길동', email: 'hong@example.com', motivation: '' }

beforeEach(() => {
  localStorage.clear()
})

describe('useFormPersistence', () => {
  describe('저장 (save)', () => {
    it('courseId가 있으면 step 1에서도 localStorage에 저장됨', () => {
      renderHook(() => useFormPersistence(baseLocal, baseRhf, 1))
      const raw = localStorage.getItem('enrollment-form-draft')
      expect(raw).not.toBeNull()
      const saved = JSON.parse(raw!)
      expect(saved.step).toBe(1)
      expect(saved.local.courseId).toBe('c1')
    })

    it('courseId 없고 step 1이면 저장하지 않음 (초기 상태)', () => {
      renderHook(() => useFormPersistence(emptyLocal, baseRhf, 1))
      expect(localStorage.getItem('enrollment-form-draft')).toBeNull()
    })

    it('step 2이면 courseId 없어도 저장됨', () => {
      renderHook(() => useFormPersistence(emptyLocal, baseRhf, 2))
      expect(localStorage.getItem('enrollment-form-draft')).not.toBeNull()
    })

    it('step이 "success"이면 저장하지 않음', () => {
      renderHook(() => useFormPersistence(baseLocal, baseRhf, 'success'))
      expect(localStorage.getItem('enrollment-form-draft')).toBeNull()
    })

    it('step이 "fail"이면 저장하지 않음', () => {
      renderHook(() => useFormPersistence(baseLocal, baseRhf, 'fail'))
      expect(localStorage.getItem('enrollment-form-draft')).toBeNull()
    })

    it('local이 변경되면 최신 값으로 덮어씀', () => {
      const { rerender } = renderHook(
        ({ local }: { local: Partial<EnrollmentFormData> }) =>
          useFormPersistence(local, baseRhf, 1),
        { initialProps: { local: baseLocal } }
      )

      rerender({ local: { ...baseLocal, courseId: 'c2' } })

      const raw = localStorage.getItem('enrollment-form-draft')
      const saved = JSON.parse(raw!)
      expect(saved.local.courseId).toBe('c2')
    })
  })

  describe('hasDraft', () => {
    it('저장된 draft가 없고 초기 상태면 hasDraft=false', () => {
      const { result } = renderHook(() => useFormPersistence(emptyLocal, baseRhf, 1))
      expect(result.current.hasDraft).toBe(false)
    })

    it('현재 세션에서 새로 저장된 draft는 hasDraft=false (배너 미표시)', () => {
      // 마운트 시점에 draft 없음 → bannerActedRef=true → 이후 저장돼도 배너 안 뜸
      const { result } = renderHook(() => useFormPersistence(baseLocal, baseRhf, 1))
      expect(result.current.hasDraft).toBe(false)
    })

    it('마운트 전에 draft가 있으면 hasDraft=true', async () => {
      localStorage.setItem(
        'enrollment-form-draft',
        JSON.stringify({ local: baseLocal, rhf: baseRhf, step: 2 })
      )
      const { result } = renderHook(() => useFormPersistence(emptyLocal, baseRhf, 'success'))
      expect(result.current.hasDraft).toBe(true)
    })
  })

  describe('recover()', () => {
    it('저장된 draft를 반환하고 hasDraft=false로 설정함', async () => {
      localStorage.setItem(
        'enrollment-form-draft',
        JSON.stringify({ local: baseLocal, rhf: baseRhf, step: 2 })
      )

      // 'success' 스텝 사용 → save effect가 실행되지 않아 기존 draft 보존
      const { result } = renderHook(() => useFormPersistence(emptyLocal, baseRhf, 'success'))

      let draft
      act(() => {
        draft = result.current.recover()
      })

      expect(draft).toMatchObject({ step: 2, local: baseLocal, rhf: baseRhf })
      expect(result.current.hasDraft).toBe(false)
    })

    it('draft가 없으면 null 반환', () => {
      // 'success' 스텝 사용 → save effect 미실행, localStorage 비어있음
      const { result } = renderHook(() => useFormPersistence(emptyLocal, baseRhf, 'success'))
      let draft
      act(() => {
        draft = result.current.recover()
      })
      expect(draft).toBeNull()
    })
  })

  describe('dismiss()', () => {
    it('localStorage를 삭제하고 hasDraft=false로 설정함', () => {
      localStorage.setItem(
        'enrollment-form-draft',
        JSON.stringify({ local: baseLocal, rhf: baseRhf, step: 1 })
      )

      const { result } = renderHook(() => useFormPersistence(emptyLocal, baseRhf, 'success'))
      expect(result.current.hasDraft).toBe(true)

      act(() => {
        result.current.dismiss()
      })

      expect(localStorage.getItem('enrollment-form-draft')).toBeNull()
      expect(result.current.hasDraft).toBe(false)
    })
  })

  describe('clear()', () => {
    it('제출 성공 후 localStorage를 삭제함', () => {
      localStorage.setItem(
        'enrollment-form-draft',
        JSON.stringify({ local: baseLocal, rhf: baseRhf, step: 3 })
      )

      const { result } = renderHook(() => useFormPersistence(emptyLocal, baseRhf, 'success'))

      act(() => {
        result.current.clear()
      })

      expect(localStorage.getItem('enrollment-form-draft')).toBeNull()
    })
  })

  describe('localStorage 불가 환경', () => {
    it('setItem 오류 시 예외를 던지지 않음', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => {
        renderHook(() => useFormPersistence(baseLocal, baseRhf, 2))
      }).not.toThrow()

      vi.restoreAllMocks()
    })
  })
})
