'use client'

import { cn } from '@/lib/utils/cn'

type InputVariant = 'default' | 'compact'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant
  hasError?: boolean
  filled?: boolean
}

const DEFAULT_BASE =
  'w-full px-4 py-3.5 rounded-md border text-ink-1 placeholder:text-ink-4 focus:outline-none transition-colors text-base tracking-tight'
const DEFAULT_FOCUS = 'focus:border-brand focus:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]'
const DEFAULT_ERROR = 'border-danger focus:border-danger shadow-[0_0_0_4px_rgba(220,60,40,0.08)]'

const COMPACT_BASE =
  'bg-ink-5/30 border border-transparent rounded-[10px] px-3 py-2.5 text-sm w-full outline-none transition-all focus:bg-white focus:border-brand'
const COMPACT_ERROR = 'border-danger bg-danger-soft'

export function Input({ variant = 'default', hasError, filled, className, ...props }: Props) {
  if (variant === 'compact') {
    return (
      <input
        className={cn(COMPACT_BASE, hasError && COMPACT_ERROR, className)}
        {...props}
      />
    )
  }

  return (
    <input
      className={cn(
        DEFAULT_BASE,
        hasError ? DEFAULT_ERROR : cn(filled ? 'border-ink-4' : 'border-ink-5', DEFAULT_FOCUS),
        className
      )}
      {...props}
    />
  )
}
