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

function checkPersistenceAvailable(): boolean {
  try {
    localStorage.setItem('__enrollment_test__', '1')
    localStorage.removeItem('__enrollment_test__')
    return true
  } catch {
    return false
  }
}

function writeDraft(draft: Draft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // quota 초과 등 런타임 실패는 무시 (마운트 시 가용 여부를 이미 확인함)
  }
}

function removeDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}


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
  const [persistenceAvailable] = useState(checkPersistenceAvailable)

  const storageHasDraft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const hasDraft = storageHasDraft && !bannerActed

  useEffect(() => {
    if (typeof step !== 'number') return
    const hasData = Boolean(local.courseId) || step > 1
    if (!hasData) return
    writeDraft({ local, rhf, step: step as 1 | 2 | 3 })
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
