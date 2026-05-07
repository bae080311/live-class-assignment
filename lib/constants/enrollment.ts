export const CATEGORY_MAP: Record<string, string | null> = {
  전체: null,
  디자인: 'design',
  개발: 'development',
  마케팅: 'marketing',
  비즈니스: 'business',
}

export const CHIP_LABELS = ['전체', '디자인', '개발', '마케팅', '비즈니스']

export function formatPrice(n: number): string {
  return n.toLocaleString('ko-KR') + '원'
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  })
}
