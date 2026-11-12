// Demo data. Point the urls at your routes: they are relative to the route that shows this block.
export interface NavSection {
  title: string
  url: string
  items: { title: string; url: string }[]
}

export const user = { name: 'Ana Silva', email: 'ana@relay.dev', initials: 'AS' }

export const navMain: NavSection[] = [
  {
    title: 'Usage',
    url: 'usage',
    items: [
      { title: 'Overview', url: 'overview' },
      { title: 'Active users', url: 'active-users' },
      { title: 'Features', url: 'features' },
      { title: 'Retention', url: 'retention' },
    ],
  },
  {
    title: 'Workspace',
    url: 'workspace',
    items: [
      { title: 'Members', url: 'members' },
      { title: 'Seats', url: 'seats' },
      { title: 'Billing', url: 'billing' },
    ],
  },
  {
    title: 'Developers',
    url: 'developers',
    items: [
      { title: 'API keys', url: 'api-keys' },
      { title: 'Webhooks', url: 'webhooks' },
      { title: 'Logs', url: 'logs' },
    ],
  },
]

// Chart rows are types, not interfaces: a chart row needs an index signature.

/** Daily active users. */
export type DailyUsers = { date: string; users: number }

/** 30 days up to 2024-06-30 (UTC dates): busy weekdays, quiet weekends, slow growth. Replace with your data. */
export const activeUsers: DailyUsers[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.UTC(2024, 5, 1 + i))
  const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6
  return {
    date: date.toISOString().slice(0, 10),
    users: Math.round((weekend ? 2150 : 3300) + 14 * i + 120 * Math.sin(i * 1.3)),
  }
})

/** Share of active users who used each feature, this month and last (%). */
export type FeatureUsage = { feature: string; current: number; previous: number }

export const featureUsage: FeatureUsage[] = [
  { feature: 'Dashboards', current: 86, previous: 80 },
  { feature: 'Reports', current: 64, previous: 61 },
  { feature: 'Alerts', current: 52, previous: 38 },
  { feature: 'Exports', current: 41, previous: 44 },
  { feature: 'API', current: 58, previous: 49 },
  { feature: 'Integrations', current: 47, previous: 35 },
]

/** Seats in use: active members and pending invites. */
export const seats = { active: 162, invited: 22, total: 200 }

/** Seats gained or lost each month. */
export type SeatChange = { month: string; seats: number }

export const seatChanges: SeatChange[] = [
  { month: 'January', seats: 12 },
  { month: 'February', seats: -4 },
  { month: 'March', seats: 18 },
  { month: 'April', seats: -7 },
  { month: 'May', seats: 9 },
  { month: 'June', seats: 15 },
]
