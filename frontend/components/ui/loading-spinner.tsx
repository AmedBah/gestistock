"use client"

import { Loader2 } from "lucide-react"

export function LoadingSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} />
}
