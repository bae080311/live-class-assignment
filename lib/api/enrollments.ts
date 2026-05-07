import { HTTPError } from 'ky'
import { apiClient } from './client'
import type { EnrollmentFormData, EnrollmentResult } from '@/lib/schemas/enrollment'

export async function submitEnrollment(data: EnrollmentFormData): Promise<EnrollmentResult> {
  const applicant = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    ...(data.motivation ? { motivation: data.motivation } : {}),
  }

  const body =
    data.type === 'group'
      ? {
          courseId: data.courseId,
          type: 'group' as const,
          applicant,
          group: {
            organizationName: data.organizationName!,
            headCount: data.headCount!,
            participants: data.participants!,
            contactPerson: data.contactPerson!,
          },
          agreedToTerms: true,
        }
      : {
          courseId: data.courseId,
          type: 'personal' as const,
          applicant,
          agreedToTerms: true,
        }

  try {
    return await apiClient.post('/api/enrollments', { json: body }).json<EnrollmentResult>()
  } catch (error) {
    if (error instanceof HTTPError) {
      const err = await error.response.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message ?? '신청 제출에 실패했어요.')
    }
    throw new Error('신청 제출에 실패했어요.')
  }
}
