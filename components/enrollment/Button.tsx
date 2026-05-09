import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center gap-2 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover active:scale-[0.98] transition-all border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'px-4 bg-ink-5/50 text-ink-2 font-semibold rounded-xl hover:bg-ink-5/70 transition-colors border-none cursor-pointer',
  ghost:
    'bg-transparent border-none px-2 py-1 rounded-lg text-[13px] font-semibold text-brand cursor-pointer tracking-tight hover:bg-brand-soft transition-colors',
}

export function Button({ variant = 'primary', className, ...props }: Props) {
  return <button className={cn(VARIANTS[variant], className)} {...props} />
}
