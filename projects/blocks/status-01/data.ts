import type { IvTrackerItem, IvTrackerStatus } from '@inlaylab/ivorie/tracker'

export type ServiceStatus = 'operational' | 'degraded' | 'outage'

export interface Service {
  name: string
  status: ServiceStatus
  /** Percent up over the shown days. */
  uptime: number
  days: IvTrackerItem[]
}

export interface Incident {
  title: string
  status: 'investigating' | 'monitoring' | 'resolved'
  date: string
  /** Newest first. */
  updates: { time: string; text: string }[]
}

export const DAYS = 30
const WORDS: Record<IvTrackerStatus, string> = { ok: 'operational', warn: 'degraded', error: 'outage', none: 'no data' }

/** One bar per day, ending on Nov 23; `issues` maps a day index to its status. */
function history(issues: Record<number, IvTrackerStatus> = {}): IvTrackerItem[] {
  return Array.from({ length: DAYS }, (_, i) => {
    const day = new Date(Date.UTC(2026, 10, 23 - (DAYS - 1) + i))
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    const status = issues[i] ?? 'ok'
    return { status, tooltip: `${label}: ${WORDS[status]}` }
  })
}

export const services: Service[] = [
  { name: 'API', status: 'operational', uptime: 99.98, days: history({ 11: 'warn' }) },
  { name: 'Dashboard', status: 'operational', uptime: 100, days: history() },
  { name: 'Builds', status: 'degraded', uptime: 99.71, days: history({ 4: 'warn', 18: 'error', 29: 'warn' }) },
  { name: 'Webhooks', status: 'operational', uptime: 99.93, days: history({ 18: 'warn' }) },
]

export const incidents: Incident[] = [
  {
    title: 'Slow build starts in eu-west',
    status: 'monitoring',
    date: 'Nov 23',
    updates: [
      { time: '10:42 UTC', text: 'A fix is out. Queue times are back to normal; we keep watching.' },
      { time: '09:58 UTC', text: 'Builds in eu-west wait up to 4 minutes to start. We are adding runners.' },
    ],
  },
  {
    title: 'Builds failed to start',
    status: 'resolved',
    date: 'Nov 12',
    updates: [
      { time: '16:20 UTC', text: 'Resolved. A bad runner image was rolled back.' },
      { time: '15:31 UTC', text: 'New builds fail to start in every region. We are on it.' },
    ],
  },
]
