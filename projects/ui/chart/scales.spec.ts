import { describe, expect, it } from 'vitest'
import { curveLinear, curveMonotoneX, curveNatural, curveStep } from 'd3-shape'
import { ivCurve, ivNiceTicks, ivPercent, ivStack, ivValueDomain } from './scales'

const rows = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: null },
]

describe('ivValueDomain', () => {
  it('starts at 0 and is nice', () => {
    expect(ivValueDomain([[3, 9]])).toEqual([0, 10])
  })

  it('includes negative values', () => {
    const [lo, hi] = ivValueDomain([[-4, 6]])
    expect(lo).toBeLessThanOrEqual(-4)
    expect(hi).toBeGreaterThanOrEqual(6)
  })

  it('is [0, 1] with no data or only zeros', () => {
    expect(ivValueDomain([])).toEqual([0, 1])
    expect(ivValueDomain([[0, 0]])).toEqual([0, 1])
  })
})

describe('ivStack', () => {
  it('stacks keys in order', () => {
    const stack = ivStack(rows, ['mobile', 'desktop'], 'none')
    expect(stack.get('mobile')?.[0]).toEqual([0, 80])
    expect(stack.get('desktop')?.[0]).toEqual([80, 266])
  })

  it('expand ends the last series at 1 for each row', () => {
    const stack = ivStack(rows, ['mobile', 'desktop'], 'expand')
    for (const point of stack.get('desktop') ?? []) expect(point?.[1]).toBe(1)
  })

  it('marks a null value undefined and stacks the next series on its base', () => {
    const stack = ivStack(rows, ['mobile', 'desktop'], 'none')
    expect(stack.get('mobile')?.[2]).toBeUndefined()
    expect(stack.get('desktop')?.[2]).toEqual([0, 237])
  })

  it('is NaN-free for an all-zero row under expand', () => {
    const stack = ivStack([{ a: 0, b: 0 }], ['a', 'b'], 'expand')
    expect(stack.get('b')?.[0]).toEqual([0, 0])
  })
})

describe('ivCurve', () => {
  it('maps names to d3 curves', () => {
    expect(ivCurve('linear')).toBe(curveLinear)
    expect(ivCurve('natural')).toBe(curveNatural)
    expect(ivCurve('step')).toBe(curveStep)
    expect(ivCurve('monotone')).toBe(curveMonotoneX)
  })
})

describe('ivPercent', () => {
  it('reads a percent or a number, clamped to [0, max]', () => {
    expect(ivPercent('10%', 200)).toBe(20)
    expect(ivPercent(30, 200)).toBe(30)
    expect(ivPercent(300, 200)).toBe(200)
    expect(ivPercent(300, 200, Infinity)).toBe(300)
    expect(ivPercent(-4, 200)).toBe(0)
    expect(ivPercent('-10%', 200)).toBe(0)
    expect(ivPercent('abc', 200)).toBe(0)
  })
})

describe('ivNiceTicks (Recharts getNiceTickValues)', () => {
  it('gives exactly count round ticks from 0 that cover the max', () => {
    // shadcn chart-radar-default (max 305) and chart-radar-lines-only (max 207), as Recharts 3.8 draws them.
    expect(ivNiceTicks(0, 305, 5)).toEqual([0, 80, 160, 240, 320])
    expect(ivNiceTicks(0, 207, 5)).toEqual([0, 55, 110, 165, 220])
    expect(ivNiceTicks(0, 100, 5)).toEqual([0, 25, 50, 75, 100])
  })

  it('centers a range away from 0, and covers negatives', () => {
    expect(ivNiceTicks(90, 275, 5)).toEqual([55, 110, 165, 220, 275])
    const ticks = ivNiceTicks(-40, 60, 5)
    expect(ticks.length).toBe(5)
    expect(ticks[0]).toBeLessThanOrEqual(-40)
    expect(ticks[4]).toBeGreaterThanOrEqual(60)
    expect(ticks).toContain(0)
  })

  it('never returns NaN for empty or flat data', () => {
    for (const ticks of [ivNiceTicks(0, 0), ivNiceTicks(NaN, 3), ivNiceTicks(5, 5)])
      expect(ticks.every(Number.isFinite)).toBe(true)
  })
})
