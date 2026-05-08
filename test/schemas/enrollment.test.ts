import { describe, it, expect } from 'vitest'
import {
  Step1Schema,
  Step2PersonalSchema,
  Step2GroupSchema,
  Step3Schema,
  validateStep1,
  validateStep2Personal,
  validateStep2Group,
  validateStep3,
} from '@/lib/schemas/enrollment'

describe('Step1Schema', () => {
  it('courseId 없으면 에러', () => {
    const result = Step1Schema.safeParse({ courseId: '', type: 'personal' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.courseId).toBeDefined()
    }
  })

  it('유효한 데이터 통과', () => {
    const result = Step1Schema.safeParse({ courseId: 'c1', type: 'personal' })
    expect(result.success).toBe(true)
  })

  it('type이 group이어도 통과', () => {
    const result = Step1Schema.safeParse({ courseId: 'c3', type: 'group' })
    expect(result.success).toBe(true)
  })

  it('잘못된 type 값 에러', () => {
    const result = Step1Schema.safeParse({ courseId: 'c1', type: 'solo' })
    expect(result.success).toBe(false)
  })
})

describe('Step2PersonalSchema', () => {
  const valid = {
    name: '홍길동',
    email: 'hong@example.com',
    phone: '01012345678',
  }

  it('유효한 개인 신청 데이터 통과', () => {
    expect(Step2PersonalSchema.safeParse(valid).success).toBe(true)
  })

  it('이름 1자 에러', () => {
    const result = Step2PersonalSchema.safeParse({ ...valid, name: '홍' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
    }
  })

  it('잘못된 이메일 형식 에러', () => {
    const result = Step2PersonalSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
    }
  })

  it('수강 동기 300자 초과 에러', () => {
    const result = Step2PersonalSchema.safeParse({ ...valid, motivation: 'a'.repeat(301) })
    expect(result.success).toBe(false)
  })

  it('수강 동기 없어도 통과', () => {
    expect(Step2PersonalSchema.safeParse(valid).success).toBe(true)
  })
})

describe('Step2GroupSchema', () => {
  const valid = {
    name: '이수진',
    email: 'sujin@example.com',
    phone: '01098765432',
    organizationName: '디자인팀',
    contactPerson: 'sujin@team.com',
    headCount: 3,
    participants: [
      { name: '이수진', email: 'sujin@team.com' },
      { name: '박재형', email: 'jaeh@team.com' },
      { name: '정승호', email: 'seungho@team.com' },
    ],
  }

  it('유효한 단체 신청 데이터 통과', () => {
    expect(Step2GroupSchema.safeParse(valid).success).toBe(true)
  })

  it('단체명 없으면 에러', () => {
    const result = Step2GroupSchema.safeParse({ ...valid, organizationName: '' })
    expect(result.success).toBe(false)
  })

  it('참가자 이메일 형식 에러', () => {
    const result = Step2GroupSchema.safeParse({
      ...valid,
      participants: [{ name: '홍길동', email: 'not-email' }, ...valid.participants.slice(1)],
    })
    expect(result.success).toBe(false)
  })

  it('인원 1명 에러 (min 2)', () => {
    const result = Step2GroupSchema.safeParse({ ...valid, headCount: 1 })
    expect(result.success).toBe(false)
  })

  it('인원 11명 에러 (max 10)', () => {
    const result = Step2GroupSchema.safeParse({ ...valid, headCount: 11 })
    expect(result.success).toBe(false)
  })
})

describe('Step3Schema', () => {
  it('agreed true이면 통과', () => {
    expect(Step3Schema.safeParse({ agreed: true }).success).toBe(true)
  })

  it('agreed false이면 에러', () => {
    expect(Step3Schema.safeParse({ agreed: false }).success).toBe(false)
  })

  it('agreed 없으면 에러', () => {
    expect(Step3Schema.safeParse({}).success).toBe(false)
  })
})

describe('validateStep1', () => {
  it('유효한 데이터를 성공으로 반환', () => {
    const result = validateStep1({ courseId: 'c1', type: 'personal' })
    expect(result.success).toBe(true)
  })

  it('courseId 누락 시 실패 반환', () => {
    const result = validateStep1({ courseId: '', type: 'personal' })
    expect(result.success).toBe(false)
  })

  it('type 누락 시 실패 반환', () => {
    const result = validateStep1({ courseId: 'c1' })
    expect(result.success).toBe(false)
  })

  it('group 타입도 성공 반환', () => {
    const result = validateStep1({ courseId: 'c2', type: 'group' })
    expect(result.success).toBe(true)
  })
})

describe('validateStep2Personal', () => {
  const valid = { name: '홍길동', email: 'hong@example.com', phone: '01012345678' }

  it('유효한 개인 데이터를 성공으로 반환', () => {
    expect(validateStep2Personal(valid).success).toBe(true)
  })

  it('이름 1자면 실패 반환', () => {
    expect(validateStep2Personal({ ...valid, name: '홍' }).success).toBe(false)
  })

  it('이메일 형식 오류 시 실패 반환', () => {
    expect(validateStep2Personal({ ...valid, email: 'not-email' }).success).toBe(false)
  })

  it('이름 20자 초과 시 실패 반환', () => {
    expect(validateStep2Personal({ ...valid, name: 'a'.repeat(21) }).success).toBe(false)
  })

  it('전화번호 누락 시 실패 반환', () => {
    const noPhone = Object.fromEntries(Object.entries(valid).filter(([k]) => k !== 'phone'))
    expect(validateStep2Personal(noPhone as typeof valid).success).toBe(false)
  })

  it('잘못된 전화번호 형식 시 실패 반환', () => {
    expect(validateStep2Personal({ ...valid, phone: '123-456' }).success).toBe(false)
  })

  it('하이픈 있는 전화번호는 실패 반환', () => {
    expect(validateStep2Personal({ ...valid, phone: '010-1234-5678' }).success).toBe(false)
  })

  it('수강 동기 300자 초과 시 실패 반환', () => {
    expect(validateStep2Personal({ ...valid, motivation: 'a'.repeat(301) }).success).toBe(false)
  })

  it('수강 동기 없어도 성공 반환', () => {
    expect(validateStep2Personal(valid).success).toBe(true)
  })
})

describe('validateStep2Group', () => {
  const valid = {
    name: '이수진',
    email: 'sujin@example.com',
    phone: '01098765432',
    organizationName: '디자인팀',
    contactPerson: 'sujin@team.com',
    headCount: 2,
    participants: [
      { name: '이수진', email: 'sujin@team.com' },
      { name: '박재형', email: 'jaeh@team.com' },
    ],
  }

  it('유효한 단체 데이터를 성공으로 반환', () => {
    expect(validateStep2Group(valid).success).toBe(true)
  })

  it('단체명 누락 시 실패 반환', () => {
    expect(validateStep2Group({ ...valid, organizationName: '' }).success).toBe(false)
  })

  it('인원 1명이면 실패 반환', () => {
    expect(validateStep2Group({ ...valid, headCount: 1 }).success).toBe(false)
  })

  it('인원 11명이면 실패 반환', () => {
    expect(validateStep2Group({ ...valid, headCount: 11 }).success).toBe(false)
  })

  it('참가자 이메일 형식 오류 시 실패 반환', () => {
    const bad = { ...valid, participants: [{ name: '홍길동', email: 'bad' }, valid.participants[1]] }
    expect(validateStep2Group(bad).success).toBe(false)
  })

  it('담당자 연락처 누락 시 실패 반환', () => {
    expect(validateStep2Group({ ...valid, contactPerson: '' }).success).toBe(false)
  })
})

describe('validateStep3', () => {
  it('agreed true이면 성공 반환', () => {
    expect(validateStep3({ agreed: true }).success).toBe(true)
  })

  it('agreed false이면 실패 반환', () => {
    expect(validateStep3({ agreed: false }).success).toBe(false)
  })

  it('agreed 누락 시 실패 반환', () => {
    expect(validateStep3({}).success).toBe(false)
  })
})
