import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EnrollmentForm } from '@/components/enrollment/EnrollmentForm'
import { fetchCourses } from '@/lib/api/courses'
import { submitEnrollment } from '@/lib/api/enrollments'

vi.mock('@/lib/api/courses', () => ({
  fetchCourses: vi.fn().mockResolvedValue({
    courses: [
      {
        id: 'c1', category: 'design', title: 'UX 라이팅 실전', instructor: '김유나',
        description: '실무 UX', maxCapacity: 20, currentEnrollment: 12,
        startDate: '2026-06-10T09:00:00+09:00', endDate: '2026-06-10T13:00:00+09:00',
        price: 89000, thumb: 'thumb-1', initial: 'UX',
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

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderForm() {
  return render(<EnrollmentForm />, { wrapper: makeWrapper() })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  // 기본 mock 재설정
  vi.mocked(fetchCourses).mockResolvedValue({
    courses: [
      {
        id: 'c1', category: 'design', title: 'UX 라이팅 실전', instructor: '김유나',
        description: '실무 UX', maxCapacity: 20, currentEnrollment: 12,
        startDate: '2026-06-10T09:00:00+09:00', endDate: '2026-06-10T13:00:00+09:00',
        price: 89000, thumb: 'thumb-1', initial: 'UX',
      },
    ],
    categories: ['design', 'development', 'marketing', 'business'],
  })
  vi.mocked(submitEnrollment).mockResolvedValue({
    enrollmentId: 'ENR-001',
    status: 'confirmed',
    enrolledAt: new Date().toISOString(),
  })
})

// ─── 헬퍼 ───────────────────────────────────────────────────────────────────

async function selectCourseAndNext(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => screen.getByText('UX 라이팅 실전'))
  await user.click(screen.getByText('UX 라이팅 실전'))
  await user.click(screen.getByText('다음'))
  await waitFor(() => screen.getByText('수강생 정보를 알려주세요.'))
}

async function fillStep2AndNext(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText('홍길동'), '홍길동')
  await user.type(screen.getByPlaceholderText('you@example.com'), 'hong@example.com')
  await user.type(screen.getByPlaceholderText('01012345678'), '01012345678')
  await user.click(screen.getByText('다음'))
  await waitFor(() => screen.getByText('신청 내용을 마지막으로 확인해주세요.'))
}

async function selectGroupCourseAndNext(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => screen.getByText('UX 라이팅 실전'))
  await user.click(screen.getByText('UX 라이팅 실전'))
  await user.click(screen.getByText('단체 신청'))
  await user.click(screen.getByText('다음'))
  await waitFor(() => screen.getByText('신청 정보를 알려주세요.'))
}

// ─── 스텝 1 ─────────────────────────────────────────────────────────────────

describe('EnrollmentForm — 스텝 1: 강의 선택', () => {
  it('강의 목록이 로드됨', async () => {
    renderForm()
    await waitFor(() => {
      expect(screen.getByText('UX 라이팅 실전')).toBeInTheDocument()
    })
  })

  it('강의 미선택 시 다음 버튼 비활성화', async () => {
    renderForm()
    await waitFor(() => screen.getByText('UX 라이팅 실전'))
    expect(screen.getByText('다음')).toBeDisabled()
  })

  it('강의 선택 후 다음 버튼 활성화', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByText('UX 라이팅 실전'))
    await user.click(screen.getByText('UX 라이팅 실전'))
    expect(screen.getByText('다음')).not.toBeDisabled()
  })

  it('강의 선택 후 다음 클릭 → 스텝 2로 이동', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    expect(screen.getByText('수강생 정보를 알려주세요.')).toBeInTheDocument()
  })

  it('TopBar 이전 버튼 클릭 → LeaveModal 표시', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByText('UX 라이팅 실전'))
    await user.click(screen.getByLabelText('이전'))
    expect(screen.getByText('지금 나가시겠어요?')).toBeInTheDocument()
  })
})

// ─── LeaveModal ──────────────────────────────────────────────────────────────

describe('EnrollmentForm — LeaveModal', () => {
  it('"이어서 작성" 클릭 → 모달 닫힘', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByText('UX 라이팅 실전'))
    await user.click(screen.getByLabelText('이전'))
    await user.click(screen.getByText('이어서 작성'))
    expect(screen.queryByText('지금 나가시겠어요?')).not.toBeInTheDocument()
  })

  it('"나갈게요" 클릭 → 폼 초기화, 스텝 1로 이동', async () => {
    const user = userEvent.setup()
    renderForm()
    await waitFor(() => screen.getByText('UX 라이팅 실전'))
    // 강의 선택 후 leaveModal trigger
    await user.click(screen.getByText('UX 라이팅 실전'))
    await user.click(screen.getByLabelText('이전'))
    await user.click(screen.getByText('나갈게요'))
    expect(screen.getByText('어떤 강의를 들어볼까요?')).toBeInTheDocument()
    // 강의 선택 배너가 사라졌는지 확인
    expect(screen.queryByText('이 강의를 선택했어요')).not.toBeInTheDocument()
  })
})

// ─── 스텝 2 ─────────────────────────────────────────────────────────────────

describe('EnrollmentForm — 스텝 2: 수강생 정보', () => {
  it('이름 빈칸 → 검증 에러', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    await user.type(screen.getByPlaceholderText('you@example.com'), 'hong@example.com')
    await user.click(screen.getByText('다음'))
    await waitFor(() => {
      expect(screen.getByText('이름은 2자 이상이어야 해요.')).toBeInTheDocument()
    })
  })

  it('이름 1자 → 검증 에러', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    await user.type(screen.getByPlaceholderText('홍길동'), '홍')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'hong@example.com')
    await user.click(screen.getByText('다음'))
    await waitFor(() => {
      expect(screen.getByText('이름은 2자 이상이어야 해요.')).toBeInTheDocument()
    })
  })

  it('이메일 형식 오류 → 검증 에러', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    await user.type(screen.getByPlaceholderText('홍길동'), '홍길동')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'invalid-email')
    await user.click(screen.getByText('다음'))
    await waitFor(() => {
      expect(screen.getByText('이메일 형식이 올바르지 않아요.')).toBeInTheDocument()
    })
  })

  it('유효한 정보 입력 후 다음 → 스텝 3으로 이동', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    await fillStep2AndNext(user)
    expect(screen.getByText('신청 내용을 마지막으로 확인해주세요.')).toBeInTheDocument()
  })

  it('이전 버튼 클릭 → 스텝 1로 이동', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    await user.click(screen.getByText('이전'))
    expect(screen.getByText('어떤 강의를 들어볼까요?')).toBeInTheDocument()
  })
})

// ─── 스텝 3 ─────────────────────────────────────────────────────────────────

describe('EnrollmentForm — 스텝 3: 확인 및 제출', () => {
  async function goToStep3() {
    const user = userEvent.setup()
    renderForm()
    await selectCourseAndNext(user)
    await fillStep2AndNext(user)
    return user
  }

  it('신청자 정보가 표시됨', async () => {
    await goToStep3()
    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('hong@example.com')).toBeInTheDocument()
  })

  it('강의 정보가 표시됨', async () => {
    await goToStep3()
    expect(screen.getByText('UX 라이팅 실전')).toBeInTheDocument()
  })

  it('약관 미동의 시 에러 메시지 표시', async () => {
    const user = await goToStep3()
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => {
      expect(screen.getByText('약관 동의가 필요해요.')).toBeInTheDocument()
    })
  })

  it('약관 동의 후 제출 성공 → 성공 화면', async () => {
    const user = await goToStep3()
    // 약관 동의 div 클릭
    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => {
      expect(screen.getByText('신청이 완료됐어요.')).toBeInTheDocument()
    })
  })

  it('성공 화면에 신청 번호 표시', async () => {
    const user = await goToStep3()
    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => {
      expect(screen.getByText('ENR-001')).toBeInTheDocument()
    })
  })

  it('제출 실패 → 실패 화면', async () => {
    const { submitEnrollment } = await import('@/lib/api/enrollments')
    vi.mocked(submitEnrollment).mockRejectedValueOnce(new Error('서버 오류'))
    const user = await goToStep3()
    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => {
      expect(screen.getByText('신청을 완료하지 못했어요.')).toBeInTheDocument()
    })
  })

  it('실패 화면에서 다시 시도 → 스텝 3으로 돌아옴', async () => {
    const { submitEnrollment } = await import('@/lib/api/enrollments')
    vi.mocked(submitEnrollment).mockRejectedValueOnce(new Error('서버 오류'))
    const user = await goToStep3()
    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => screen.getByText('다시 시도하기'))
    await user.click(screen.getByText('다시 시도하기'))
    expect(screen.getByText('신청 내용을 마지막으로 확인해주세요.')).toBeInTheDocument()
  })

  it('제출 시 선택한 courseId가 payload에 포함됨', async () => {
    const user = await goToStep3()
    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => {
      expect(vi.mocked(submitEnrollment)).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 'c1' })
      )
    })
  })

  it('이전 버튼 클릭 → 스텝 2로 이동', async () => {
    const user = await goToStep3()
    await user.click(screen.getByText('이전'))
    expect(screen.getByText('수강생 정보를 알려주세요.')).toBeInTheDocument()
  })

  it('성공 후 처음으로 → 스텝 1로 돌아옴', async () => {
    const user = await goToStep3()
    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))
    await waitFor(() => screen.getByText('처음으로 돌아가기'))
    await user.click(screen.getByText('처음으로 돌아가기'))
    expect(screen.getByText('어떤 강의를 들어볼까요?')).toBeInTheDocument()
  })
})

// ─── 단체 신청 ───────────────────────────────────────────────────────────────

describe('EnrollmentForm — 단체 신청 스텝 2', () => {
  it('단체 신청 선택 후 스텝 2에 단체 정보 영역이 표시됨', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectGroupCourseAndNext(user)
    expect(screen.getByText('단체 정보')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 디자인팀, OO기업')).toBeInTheDocument()
  })

  it('참가자 정보 미입력 시 스텝 3으로 넘어가지 않음', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectGroupCourseAndNext(user)

    await user.type(screen.getByPlaceholderText('홍길동'), '홍길동')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'hong@example.com')
    await user.type(screen.getByPlaceholderText('01012345678'), '01012345678')
    await user.type(screen.getByPlaceholderText('예: 디자인팀, OO기업'), '디자인팀')
    await user.type(screen.getByPlaceholderText('이메일 또는 전화번호'), 'contact@team.com')
    await user.click(screen.getByText('다음'))

    expect(screen.queryByText('신청 내용을 마지막으로 확인해주세요.')).not.toBeInTheDocument()
    expect(screen.getByText('신청 정보를 알려주세요.')).toBeInTheDocument()
    // 참가자 이름 필드에 에러 메시지가 표시되어야 함
    expect(screen.getAllByText('참가자 이름을 입력해주세요.').length).toBeGreaterThan(0)
  })

  it('참가자 정보 입력 후 스텝 3으로 정상 이동', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectGroupCourseAndNext(user)

    await user.type(screen.getByPlaceholderText('홍길동'), '홍길동')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'hong@example.com')
    await user.type(screen.getByPlaceholderText('01012345678'), '01012345678')
    await user.type(screen.getByPlaceholderText('예: 디자인팀, OO기업'), '디자인팀')
    await user.type(screen.getByPlaceholderText('이메일 또는 전화번호'), 'contact@team.com')

    const nameInputs = screen.getAllByPlaceholderText('이름')
    const emailInputs = screen.getAllByPlaceholderText('이메일')
    await user.type(nameInputs[0], '참가자일')
    await user.type(emailInputs[0], 'p1@team.com')
    await user.type(nameInputs[1], '참가자이')
    await user.type(emailInputs[1], 'p2@team.com')

    await user.click(screen.getByText('다음'))
    await waitFor(() => {
      expect(screen.getByText('신청 내용을 마지막으로 확인해주세요.')).toBeInTheDocument()
    })
  })

  it('제출 시 courseId·type·참가자 정보가 payload에 포함됨', async () => {
    const user = userEvent.setup()
    renderForm()
    await selectGroupCourseAndNext(user)

    await user.type(screen.getByPlaceholderText('홍길동'), '홍길동')
    await user.type(screen.getByPlaceholderText('you@example.com'), 'hong@example.com')
    await user.type(screen.getByPlaceholderText('01012345678'), '01012345678')
    await user.type(screen.getByPlaceholderText('예: 디자인팀, OO기업'), '디자인팀')
    await user.type(screen.getByPlaceholderText('이메일 또는 전화번호'), 'contact@team.com')

    const nameInputs = screen.getAllByPlaceholderText('이름')
    const emailInputs = screen.getAllByPlaceholderText('이메일')
    await user.type(nameInputs[0], '참가자일')
    await user.type(emailInputs[0], 'p1@team.com')
    await user.type(nameInputs[1], '참가자이')
    await user.type(emailInputs[1], 'p2@team.com')

    await user.click(screen.getByText('다음'))
    await waitFor(() => screen.getByText('신청 내용을 마지막으로 확인해주세요.'))

    fireEvent.click(screen.getByText(/이용약관 및 개인정보 처리방침/).closest('div')!)
    await user.click(screen.getByText('신청 제출하기'))

    await waitFor(() => {
      expect(vi.mocked(submitEnrollment)).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: 'c1',
          type: 'group',
          participants: expect.arrayContaining([
            expect.objectContaining({ name: '참가자일', email: 'p1@team.com' }),
          ]),
        })
      )
    })
  })
})
