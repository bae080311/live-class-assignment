'use client'

import { useState, useEffect } from 'react'

export function useCopyFeedback(text: string, duration = 2000) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), duration)
    return () => clearTimeout(t)
  }, [copied, duration])

  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => undefined)
    setCopied(true)
  }

  return { copied, copy }
}
