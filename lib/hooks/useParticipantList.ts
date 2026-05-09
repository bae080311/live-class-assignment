'use client'

import type { EnrollmentFormData } from '@/lib/schemas/enrollment'

type Participant = { name: string; email: string }

export function useParticipantList(
  participants: Participant[] | undefined,
  set: (patch: Partial<EnrollmentFormData>) => void
) {
  const resize = (count: number) => {
    const list = [...(participants ?? [])]
    while (list.length < count) list.push({ name: '', email: '' })
    list.length = count
    set({ headCount: count, participants: list })
  }

  const updateField = (index: number, field: 'name' | 'email', value: string) => {
    const list = [...(participants ?? [])]
    list[index] = { ...list[index], [field]: value }
    set({ participants: list })
  }

  return { resize, updateField }
}
