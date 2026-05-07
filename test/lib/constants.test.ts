import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, THUMB_GRADIENTS, CATEGORY_MAP, CHIP_LABELS } from '@/lib/constants/enrollment'

describe('formatPrice', () => {
  it('89000 → 89,000원', () => {
    expect(formatPrice(89000)).toBe('89,000원')
  })

  it('0 → 0원', () => {
    expect(formatPrice(0)).toBe('0원')
  })

  it('1000000 → 1,000,000원', () => {
    expect(formatPrice(1000000)).toBe('1,000,000원')
  })

  it('49000 → 49,000원', () => {
    expect(formatPrice(49000)).toBe('49,000원')
  })
})

describe('formatDate', () => {
  it('ISO 날짜를 한국어 형식으로 변환 — 연도 포함', () => {
    const result = formatDate('2026-06-10T09:00:00+09:00')
    expect(result).toContain('2026')
  })

  it('월 정보 포함', () => {
    const result = formatDate('2026-06-10T09:00:00+09:00')
    expect(result).toContain('6')
  })

  it('일 정보 포함', () => {
    const result = formatDate('2026-06-10T09:00:00+09:00')
    expect(result).toContain('10')
  })

  it('시간 정보 포함 (HH:MM 형식)', () => {
    const result = formatDate('2026-06-10T09:00:00+09:00')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('다른 날짜도 정상 처리', () => {
    const result = formatDate('2026-07-02T19:00:00+09:00')
    expect(result).toContain('2026')
    expect(result).toContain('7')
  })
})

describe('THUMB_GRADIENTS', () => {
  it('thumb-1 ~ thumb-6 키 존재', () => {
    expect(THUMB_GRADIENTS['thumb-1']).toBeDefined()
    expect(THUMB_GRADIENTS['thumb-6']).toBeDefined()
  })

  it('linear-gradient 값 포함', () => {
    expect(THUMB_GRADIENTS['thumb-1']).toContain('linear-gradient')
  })
})

describe('CATEGORY_MAP', () => {
  it('전체 키는 null 값', () => {
    expect(CATEGORY_MAP['전체']).toBeNull()
  })

  it('디자인 → design 매핑', () => {
    expect(CATEGORY_MAP['디자인']).toBe('design')
  })

  it('개발 → development 매핑', () => {
    expect(CATEGORY_MAP['개발']).toBe('development')
  })
})

describe('CHIP_LABELS', () => {
  it('5개 카테고리 레이블 포함', () => {
    expect(CHIP_LABELS).toHaveLength(5)
    expect(CHIP_LABELS).toContain('전체')
    expect(CHIP_LABELS).toContain('개발')
  })
})
