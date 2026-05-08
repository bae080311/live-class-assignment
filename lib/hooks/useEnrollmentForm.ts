'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import {
  Step2PersonalSchema,
  Step2GroupSchema,
  Step3Schema,
  validateStep1,
  type EnrollmentFormData,
  type RHFData,
  type EnrollmentResult,
  type SaveState,
} from '@/lib/schemas/enrollment'
import { fetchCourses } from '@/lib/api/courses'
import { submitEnrollment } from '@/lib/api/enrollments'
import { useFormPersistence } from './useFormPersistence'

export type Step = 1 | 2 | 3 | 'success' | 'fail'

const INITIAL: RHFData = {
  courseId: '',
  type: 'personal',
  name: '',
  email: '',
  phone: '',
  organizationName: '',
  contactPerson: '',
  headCount: 2,
  participants: [
    { name: '', email: '' },
    { name: '', email: '' },
  ],
  motivation: '',
  agreed: false,
}

function extractParticipantErrors(
  error: z.ZodError,
  count: number
): { name?: string; email?: string }[] {
  const pErrors: { name?: string; email?: string }[] = Array.from({ length: count }, () => ({}))
  error.issues.forEach(issue => {
    if (issue.path[0] === 'participants' && typeof issue.path[1] === 'number') {
      const idx = issue.path[1]
      const field = issue.path[2]
      if (field === 'name' || field === 'email') {
        pErrors[idx] = { ...pErrors[idx], [field]: issue.message }
      }
    }
  })
  return pErrors
}

export function useEnrollmentForm() {
  const [step, setStep] = useState<Step>(1)
  const [showCourseError, setShowCourseError] = useState(false)
  const [agreedError, setAgreedError] = useState('')
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [enrollmentId, setEnrollmentId] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [participantErrors, setParticipantErrors] = useState<{ name?: string; email?: string }[]>([])
  const [localState, setLocalState] = useState<Partial<EnrollmentFormData>>(INITIAL)

  const set = (patch: Partial<EnrollmentFormData>) =>
    setLocalState(s => ({ ...s, ...patch }))

  const { data: courseData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchCourses(),
  })
  const courses = courseData?.courses ?? []

  const {
    register,
    formState: { errors },
    getValues,
    reset,
    setError,
    clearErrors,
    control,
  } = useForm<RHFData>({ defaultValues: INITIAL, mode: 'onSubmit' })

  const watchedRHF = useWatch({ control }) as Record<string, unknown>

  const { hasDraft, recover, dismiss, clear } = useFormPersistence(localState, watchedRHF, step)

  useEffect(() => {
    const isDirty = Boolean(localState.courseId) || (typeof step === 'number' && step > 1)
    if (!isDirty || step === 'success' || step === 'fail') return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [localState.courseId, step])

  useEffect(() => {
    if (step === 1 || step === 'success' || step === 'fail') return
    const t = setInterval(() => {
      setSaveState('saving')
      setTimeout(() => setSaveState('saved'), 800)
    }, 6000)
    return () => clearInterval(t)
  }, [step])

  const mutation = useMutation({
    mutationFn: (data: EnrollmentFormData) => submitEnrollment(data),
    onSuccess: (result: EnrollmentResult) => {
      clear()
      setEnrollmentId(result.enrollmentId)
      setStep('success')
    },
    onError: (error: Error) => {
      setSubmitError(error.message)
      setStep('fail')
    },
  })

  const handleRecover = () => {
    const draft = recover()
    if (!draft) return
    reset(draft.rhf as RHFData)
    setLocalState(draft.local)
    setStep(draft.step)
  }

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1(localState).success) {
        setShowCourseError(true)
        return
      }
      setShowCourseError(false)
      setStep(2)
      return
    }

    if (step === 2) {
      const schema = localState.type === 'group' ? Step2GroupSchema : Step2PersonalSchema
      const { name, email, phone, organizationName, contactPerson, motivation } = getValues()
      const result = schema.safeParse({ ...localState, name, email, phone, organizationName, contactPerson, motivation })

      if (!result.success) {
        clearErrors()
        const fieldErrors = z.flattenError(result.error).fieldErrors
        ;(['name', 'email', 'phone', 'organizationName', 'contactPerson'] as const).forEach(field => {
          const msg = fieldErrors[field as keyof typeof fieldErrors]?.[0]
          if (msg) setError(field, { message: msg })
        })
        setParticipantErrors(extractParticipantErrors(result.error, localState.participants?.length ?? 0))
        return
      }

      clearErrors()
      setParticipantErrors([])
      setStep(3)
      return
    }

    if (step === 3) {
      if (!Step3Schema.safeParse({ agreed: localState.agreed }).success) {
        setAgreedError('약관 동의가 필요해요.')
        return
      }
      setAgreedError('')
      const { courseId, type } = localState
      if (!courseId || !type) return
      const { name, email, phone, organizationName, contactPerson, motivation } = getValues()
      mutation.mutate({ ...localState, name, email, phone, organizationName, contactPerson, motivation, courseId, type, agreed: true })
    }
  }

  const handleBack = () => {
    if (step === 1) setShowLeaveModal(true)
    else if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  const handleJumpTo = (n: number) => setStep(n as Step)

  const handleReset = () => {
    clear()
    reset(INITIAL)
    setLocalState(INITIAL)
    setStep(1)
    setShowCourseError(false)
    setAgreedError('')
    setEnrollmentId('')
  }

  const isResult = step === 'success' || step === 'fail'
  const numericStep = typeof step === 'number' ? step : 0
  const mergedState = { ...localState, ...getValues(), agreed: localState.agreed, courseId: localState.courseId }

  return {
    step,
    isResult,
    numericStep,
    localState,
    mergedState,
    set,
    showCourseError,
    agreedError,
    showLeaveModal,
    setShowLeaveModal,
    saveState,
    enrollmentId,
    submitError,
    participantErrors,
    courses,
    coursesLoading,
    register,
    errors,
    watchedRHF,
    isPending: mutation.isPending,
    hasDraft,
    dismiss,
    handleNext,
    handleBack,
    handleReset,
    handleRecover,
    handleJumpTo,
  }
}
