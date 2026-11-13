import {
  lucideActivity,
  lucideAppWindow,
  lucideBookOpen,
  lucideFileChartColumn,
  lucideGlobe,
  lucideLayoutDashboard,
  lucideLifeBuoy,
  lucideSend,
} from '@ng-icons/lucide'

// Demo data. Point the urls at your routes: they are relative to the route that shows this block.
export interface NavItem {
  title: string
  url: string
  /** An svg string from @ng-icons. */
  icon: string
  items?: { title: string; url: string }[]
}

export const user = { name: 'Maya Chen', email: 'maya@pulse.dev', initials: 'MC' }

export const navMain: NavItem[] = [
  {
    title: 'Overview',
    url: 'overview',
    icon: lucideLayoutDashboard,
    items: [
      { title: 'Realtime', url: 'realtime' },
      { title: 'Audience', url: 'audience' },
      { title: 'Retention', url: 'retention' },
    ],
  },
  {
    title: 'Acquisition',
    url: 'acquisition',
    icon: lucideGlobe,
    items: [
      { title: 'Channels', url: 'channels' },
      { title: 'Campaigns', url: 'campaigns' },
      { title: 'Referrals', url: 'referrals' },
    ],
  },
  {
    title: 'Behavior',
    url: 'behavior',
    icon: lucideActivity,
    items: [
      { title: 'Pages', url: 'pages' },
      { title: 'Events', url: 'events' },
      { title: 'Funnels', url: 'funnels' },
    ],
  },
  {
    title: 'Reports',
    url: 'reports',
    icon: lucideFileChartColumn,
    items: [
      { title: 'Saved', url: 'saved-reports' },
      { title: 'Scheduled', url: 'scheduled-reports' },
    ],
  },
]

/** The sites this workspace tracks. */
export const properties = [
  { name: 'Marketing site', url: 'marketing-site', icon: lucideGlobe },
  { name: 'Docs', url: 'docs', icon: lucideBookOpen },
  { name: 'Web app', url: 'web-app', icon: lucideAppWindow },
]

export const navSecondary = [
  { title: 'Support', url: 'support', icon: lucideLifeBuoy },
  { title: 'Feedback', url: 'feedback', icon: lucideSend },
]

// Chart rows are types, not interfaces: a chart row needs an index signature.

/** Daily sessions by channel. */
export type DailySessions = { date: string; organic: number; direct: number }

/** 90 days of sessions up to 2024-06-30 (UTC dates), with a weekly rhythm and steady growth. Replace with your data. */
export const sessions: DailySessions[] = Array.from({ length: 90 }, (_, i) => {
  const week = Math.sin((2 * Math.PI * i) / 7)
  return {
    date: new Date(Date.UTC(2024, 3, 2 + i)).toISOString().slice(0, 10),
    organic: Math.round(1640 + 9 * i + 320 * week + 140 * Math.sin(i * 1.7)),
    direct: Math.round(820 + 4 * i + 180 * week + 90 * Math.cos(i * 2.3)),
  }
})

/** Monthly sessions by device. */
export type DeviceSessions = { month: string; desktop: number; mobile: number; tablet: number }

export const devices: DeviceSessions[] = [
  { month: 'January', desktop: 31200, mobile: 22400, tablet: 4100 },
  { month: 'February', desktop: 29800, mobile: 24100, tablet: 3900 },
  { month: 'March', desktop: 33600, mobile: 26900, tablet: 4400 },
  { month: 'April', desktop: 35100, mobile: 29300, tablet: 4200 },
  { month: 'May', desktop: 37900, mobile: 31800, tablet: 4700 },
  { month: 'June', desktop: 39400, mobile: 35200, tablet: 4900 },
]

/** Monthly sign-ups and trials started. */
export type Conversions = { month: string; signups: number; trials: number }

export const conversions: Conversions[] = [
  { month: 'January', signups: 1240, trials: 610 },
  { month: 'February', signups: 1380, trials: 640 },
  { month: 'March', signups: 1310, trials: 720 },
  { month: 'April', signups: 1590, trials: 810 },
  { month: 'May', signups: 1720, trials: 905 },
  { month: 'June', signups: 1960, trials: 1040 },
]
