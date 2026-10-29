import { describe, expect, it } from 'vitest'
import { connectedPositions } from './position'

describe('connectedPositions', () => {
  it('bottom start with side offset', () => {
    expect(connectedPositions('bottom', 'start', 4)).toEqual([
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4, offsetX: 0 },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4, offsetX: 0 },
    ])
  })

  it('right end puts align offset on the cross axis', () => {
    expect(connectedPositions('right', 'end', 6, 2)[0]).toEqual({
      originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: 6, offsetY: 2,
    })
  })

  it('matches the old tooltipPositions("top") plus offsetX 0', () => {
    // Old tooltipPositions('top') used sideOffset 6 by default.
    expect(connectedPositions('top', 'center', 6)).toEqual([
      { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6, offsetX: 0 },
      { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6, offsetX: 0 },
    ])
  })
})
