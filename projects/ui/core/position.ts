import { ConnectedPosition } from '@angular/cdk/overlay'

export type Side = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'

/**
 * CDK overlay positions for a panel next to its trigger: `[main, fallback]`.
 * The fallback flips to the opposite side. `alignOffset` moves along the cross axis.
 */
export function connectedPositions(
  side: Side,
  align: Align = 'center',
  sideOffset = 0,
  alignOffset = 0,
): ConnectedPosition[] {
  if (side === 'top' || side === 'bottom') {
    const offsetY = side === 'bottom' ? sideOffset : -sideOffset
    const main: ConnectedPosition = {
      originX: align,
      originY: side === 'bottom' ? 'bottom' : 'top',
      overlayX: align,
      overlayY: side === 'bottom' ? 'top' : 'bottom',
      offsetY,
      offsetX: alignOffset,
    }
    const fallback: ConnectedPosition = {
      ...main,
      originY: side === 'bottom' ? 'top' : 'bottom',
      overlayY: side === 'bottom' ? 'bottom' : 'top',
      offsetY: -offsetY,
    }
    return [main, fallback]
  }

  const y = align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center'
  const offsetX = side === 'right' ? sideOffset : -sideOffset
  const main: ConnectedPosition = {
    originX: side === 'right' ? 'end' : 'start',
    originY: y,
    overlayX: side === 'right' ? 'start' : 'end',
    overlayY: y,
    offsetX,
    offsetY: alignOffset,
  }
  const fallback: ConnectedPosition = {
    ...main,
    originX: side === 'right' ? 'start' : 'end',
    overlayX: side === 'right' ? 'end' : 'start',
    offsetX: -offsetX,
  }
  return [main, fallback]
}
