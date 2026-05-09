'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from './Button'

export function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-ink-5 overflow-hidden">
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  onEdit,
}: {
  title: string
  onEdit?: () => void
}) {
  return (
    <div className="px-5 py-3 border-b border-ink-5 flex items-center justify-between">
      <h3 className="text-[13px] font-semibold text-ink-3 m-0 uppercase tracking-wide">{title}</h3>
      {onEdit && (
        <Button variant="ghost" onClick={onEdit}>
          수정
        </Button>
      )}
    </div>
  )
}

export function DataRow({
  label,
  children,
  last,
}: {
  label: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={cn('flex justify-between px-5 py-3 text-sm', !last && 'border-b border-ink-5')}>
      <span className="text-ink-3">{label}</span>
      <span className="text-ink-1 font-medium">{children}</span>
    </div>
  )
}
