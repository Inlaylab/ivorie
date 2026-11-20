/** One plan limit. Feed these from your billing API. */
export interface Quota {
  label: string
  used: number
  limit: number
  unit: string
}

export interface Plan {
  name: string
  /** When the counters go back to zero. */
  resets: string
}

export const plan: Plan = { name: 'Pro', resets: 'December 1' }

export const quotas: Quota[] = [
  { label: 'Storage', used: 68, limit: 100, unit: 'GB' },
  { label: 'Seats', used: 9, limit: 10, unit: 'seats' },
  { label: 'Build minutes', used: 2140, limit: 3000, unit: 'min' },
]

/** At this share of a limit, the meter turns and the card suggests an upgrade. */
export const NEAR_LIMIT = 0.8
