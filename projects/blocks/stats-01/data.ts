/** One key number. Feed these from your API. */
export interface Kpi {
  label: string
  value: string
  /** Change against the previous period, in percent. */
  delta: number
  /** Down is good (cost, latency, churn). */
  invert?: boolean
  note: string
  /** The last few periods, oldest first, for the sparkline. */
  trend: number[]
  icon: 'revenue' | 'users' | 'orders' | 'latency'
}

export const kpis: Kpi[] = [
  { label: 'Revenue', value: '$48,200', delta: 12.4, note: 'vs. last 30 days', trend: [31, 34, 33, 38, 41, 40, 44, 48], icon: 'revenue' },
  { label: 'Active users', value: '9,870', delta: 4.1, note: 'Weekly, unique', trend: [8.9, 9.1, 9.0, 9.3, 9.4, 9.6, 9.7, 9.87], icon: 'users' },
  { label: 'Orders', value: '1,284', delta: -2.3, note: 'vs. last 30 days', trend: [140, 152, 149, 138, 135, 131, 129, 128], icon: 'orders' },
  { label: 'Response time', value: '182 ms', delta: -8.4, invert: true, note: 'Median, all regions', trend: [240, 226, 230, 210, 198, 190, 186, 182], icon: 'latency' },
]
