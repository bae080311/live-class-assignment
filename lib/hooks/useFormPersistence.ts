'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { EnrollmentFormData } from '@/lib/schemas/enrollment'

const STORAGE_KEY = 'enrollment-form-draft'

export type Draft = {
  local: Partial<EnrollmentFormData>
  rhf: Record<string, unknown>
  step: 1 | 2 | 3
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Draft
  } catch {
    return null
  }
}

// 모듈 레벨에서 한 번만 실행 — getSnapshot은 순수 함수여야 하므로 side-effect를 캐싱
let _persistenceAvailable: boolean | null = null
function getPersistenceAvailable(): boolean {
  if (_persistenceAvailable === null) {
    try {
      localStorage.setItem('__enrollment_test__', '1')
      localStorage.removeItem('__enrollment_test__')
      _persistenceAvailable = true
    } catch {
      _persistenceAvailable = false
    }
  }
  return _persistenceAvailable
}

function writeDraft(draft: Draft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // quota 초과 등 런타임 실패는 무시
  }
}

function removeDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

// 디바운스: 입력마다 디스크 I/O 방지
function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const debouncedWriteDraft = debounce(writeDraft, 500)

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emitChange(): void {
  listeners.forEach(l => l())
}

function getSnapshot(): boolean {
  return readDraft() !== null
}

function getServerSnapshot(): boolean {
  return false
}


export function useFormPersistence(
  local: Partial<EnrollmentFormData>,
  rhf: Record<string, unknown>,
  step: number | string
) {
  const [bannerActed, setBannerActed] = useState(() => !getSnapshot())

  const persistenceAvailable = useSyncExternalStore(
    () => () => {},
    getPersistenceAvailable,
    () => true
  )

  const storageHasDraft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const hasDraft = storageHasDraft && !bannerActed

  useEffect(() => {
    if (typeof step !== 'number') return
    const hasData = Boolean(local.courseId) || step > 1
    if (!hasData) return
    debouncedWriteDraft({ local, rhf, step: step as 1 | 2 | 3 })
    emitChange()
  }, [local, rhf, step])

  const recover = (): Draft | null => {
    setBannerActed(true)
    const draft = readDraft()
    removeDraft()
    emitChange()
    return draft
  }

  const dismiss = () => {
    setBannerActed(true)
    removeDraft()
    emitChange()
  }

  const clear = () => {
    removeDraft()
    emitChange()
  }

  return { hasDraft, recover, dismiss, clear, persistenceAvailable }
}
