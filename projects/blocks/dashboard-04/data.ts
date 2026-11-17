// Demo data. Point the urls at your routes: they are relative to the route that shows this block.
export interface NavSection {
  title: string
  url: string
  items: { title: string; url: string }[]
}

// The Ivorie mark, one color: it takes the text color, so it follows the theme.
export const ivorieLogo =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="17 16 129 129" fill="currentColor"><path d="M55.04 18.86c2.6-1.53 5.21-1.53 7.81 0l64.56 38c2.32 1.36 3.47 3.41 3.47 6.13v49.59c0 2.04-.87 2.55-2.6 1.53L84.43 88.3c-1.45-.85-2.17-2.13-2.17-3.83V36.63c0-1.02-.43-1.28-1.3-.77L34.3 63.33c-1.45.85-2.17.42-2.17-1.28V35.41c0-2.04.87-3.58 2.61-4.6z"/><path d="M32.13 85.05c0-2.04.87-3.58 2.6-4.6L68.92 60.32c.87-.51 1.3-.26 1.3.77v33.67c0 1.7.72 2.98 2.17 3.83l38.84 22.86c1.74 1.02 1.74 2.04 0 3.07l-30.77 18.11c-2.6 1.53-5.21 1.53-7.82 0L35.16 120.57c-2.02-1.19-3.04-2.98-3.04-5.37z"/></svg>'

export const user = { name: 'Ivorie', email: 'hello@example.com', initials: 'IV' }

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
