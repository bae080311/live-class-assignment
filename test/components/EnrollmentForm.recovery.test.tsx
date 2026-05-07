import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EnrollmentForm } from '@/components/enrollment/EnrollmentForm'

// ─── Mock ───────────────────────────────────────────────────────────────────


vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn().mockResolvedValue({
    courses: [
      {
        id: 'c1', category: 'design', title: 'UX 라이팅 실전', instructor: '김유나',
        description: '실무 UX', maxCapacity: 20, currentEnrollment: 12,
        startDate: '2026-06-10T09:00:00+09:00', endDate: '2026-06-10T13:00:00+09:00',
        price: 89000,
      },
    ],
    categories: ['design', 'development', 'marketing', 'business'],
  }),
}))

vi.mock('@/lib/api/enrollments', () => ({
  submitEnrollment: vi.fn().mockResolvedValue({
    enrollmentId: 'ENR-001',
    status: 'confirmed',
    enrolledAt: new Date().toISOString(),
  }),
}))

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'enrollment-form-draft'

function setDraft(draft: object) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

function getDraft() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderForm() {
  return render(<EnrollmentForm />, { wrapper: makeWrapper() })
}

// ─── 공통 draft fixture ──────────────────────────────────────────────────────

const step1Draft = {
  local: { courseId: 'c1', type: 'personal', name: '', email: '', agreed: false },
  rhf: {
    courseId: 'c1', type: 'personal', name: '', email: '',
    organizationName: '', contactPerson: '', headCount: 2,
    participants: [{ name: '', email: '' }, { name: '', email: '' }],
    motivation: '', agreed: false,
  },
  step: 1,
}

const step2Draft = {
  local: { courseId: 'c1', type: 'personal', name: '', email: '', agreed: false },
  rhf: {
    courseId: 'c1', type: 'personal', name: '홍길동', email: 'hong@example.com',
    organizationName: '', contactPerson: '', headCount: 2,
    participants: [{ name: '', email: '' }, { name: '', email: '' }],
    motivation: '', agreed: false,
  },
  step: 2,
}

// ─── 테스트 ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
})

describe('EnrollmentForm — 이탈 후 데이터 복구', () => {
  describe('RecoverBanner 표시', () => {
    it('localStorage에 draft가 있으면 RecoverBanner가 표시됨', async () => {
      setDraft(step1Draft)
      renderForm()

      await waitFor(() => {
        expect(screen.getByText('이전에 작성하던 내용이 있어요. 이어서 작성할까요?')).toBeInTheDocument()
      })
    })

    it('localStorage가 비어있으면 RecoverBanner가 표시되지 않음', async () => {
      renderForm()

      await waitFor(() => {
        expect(screen.getByText('어떤 강의를 들어볼까요?')).toBeInTheDocument()
      })
      expect(screen.queryByText('이전에 작성하던 내용이 있어요. 이어서 작성할까요?')).not.toBeInTheDocument()
    })
  })

  describe('"이어서 작성" — 스텝 1 복구', () => {
    it('강의 선택 상태가 복구됨', async () => {
      const user = userEvent.setup()
      setDraft(step1Draft)
      renderForm()

      await waitFor(() => screen.getByText('이어서 작성'))
      await user.click(screen.getByText('이어서 작성'))

      // 강의 목록 로드 후 선택 배너 확인
      await waitFor(() => {
        expect(screen.getByText('이 강의를 선택했어요')).toBeInTheDocument()
      })
    })

    it('RecoverBanner가 사라짐', async () => {
      const user = userEvent.setup()
      setDraft(step1Draft)
      renderForm()

      await waitFor(() => screen.getByText('이어서 작성'))
      await user.click(screen.getByText('이어서 작성'))

      expect(screen.queryByText('이전에 작성하던 내용이 있어요. 이어서 작성할까요?')).not.toBeInTheDocument()
    })
  })

  describe('"이어서 작성" — 스텝 2 복구', () => {
    it('스텝 2 화면으로 이동함', async () => {
      const user = userEvent.setup()
      setDraft(step2Draft)
      renderForm()

      await waitFor(() => screen.getByText('이어서 작성'))
      await user.click(screen.getByText('이어서 작성'))

      await waitFor(() => {
        expect(screen.getByText('수강생 정보를 알려주세요.')).toBeInTheDocument()
      })
    })

    it('이름, 이메일이 복구됨', async () => {
      const user = userEvent.setup()
      setDraft(step2Draft)
      renderForm()

      await waitFor(() => screen.getByText('이어서 작성'))
      await user.click(screen.getByText('이어서 작성'))

      await waitFor(() => {
        expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument()
        expect(screen.getByDisplayValue('hong@example.com')).toBeInTheDocument()
      })
    })
  })

  describe('"✕" 클릭 — 새로 시작', () => {
    it('RecoverBanner가 사라짐', async () => {
      const user = userEvent.setup()
      setDraft(step1Draft)
      renderForm()

      await waitFor(() => screen.getByLabelText('닫기'))
      await user.click(screen.getByLabelText('닫기'))

      expect(screen.queryByText('이전에 작성하던 내용이 있어요. 이어서 작성할까요?')).not.toBeInTheDocument()
    })

    it('draft가 localStorage에서 삭제됨', async () => {
      const user = userEvent.setup()
      setDraft(step1Draft)
      renderForm()

      await waitFor(() => screen.getByLabelText('닫기'))
      await user.click(screen.getByLabelText('닫기'))

      expect(getDraft()).toBeNull()
    })

    it('스텝 1 빈 폼 상태 유지 — 강의 선택 배너 없음', async () => {
      const user = userEvent.setup()
      setDraft(step1Draft)
      renderForm()

      await waitFor(() => screen.getByLabelText('닫기'))
      await user.click(screen.getByLabelText('닫기'))

      expect(screen.queryByText('이 강의를 선택했어요')).not.toBeInTheDocument()
      expect(screen.getByText('어떤 강의를 들어볼까요?')).toBeInTheDocument()
    })
  })

  describe('제출 성공 후 draft 삭제', () => {
    it('신청 완료 후 localStorage가 비워짐', async () => {
      const user = userEvent.setup()

      // step 3 직전까지 채워진 draft
      const step3Draft = {
        local: {
          courseId: 'c1', type: 'personal', name: '', email: '', agreed: true,
        },
        rhf: {
          courseId: 'c1', type: 'personal', name: '홍길동', email: 'hong@example.com',
          organizationName: '', contactPerson: '', headCount: 2,
          participants: [{ name: '', email: '' }, { name: '', email: '' }],
          motivation: '', agreed: true,
        },
        step: 3,
      }
      setDraft(step3Draft)
      renderForm()

      // 이어서 작성 → 스텝 3으로 이동
      await waitFor(() => screen.getByText('이어서 작성'))
      await user.click(screen.getByText('이어서 작성'))

      // 스텝 3에서 제출 (draft에 agreed:true가 이미 포함됨)
      await waitFor(() => screen.getByText('신청 내용을 마지막으로 확인해주세요.'))
      await user.click(screen.getByText('신청 제출하기'))

      // 성공 화면 확인 + localStorage 삭제 확인
      await waitFor(() => {
        expect(screen.getByText('신청이 완료됐어요.')).toBeInTheDocument()
      })
      expect(getDraft()).toBeNull()
    })
  })
})
