import { ComponentRef, DestroyRef, Directive, ElementRef, ViewContainerRef, inject, input } from '@angular/core'
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { connectedPositions } from '@inlaylab/ivorie/core'
import { TooltipPanelComponent, TooltipSide } from './tooltip-overlay'

/**
 * Shows `text` in a tooltip on hover — only when the host's content is clipped
 * (scrollWidth > clientWidth). Works on truncated spans and on text inputs.
 * The host must already clip its content (e.g. `truncate`, or an `<input>`).
 *
 *   <span class="truncate" [ivTruncateTooltip]="label">{{ label }}</span>
 */
@Directive({
  selector: '[ivTruncateTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    // Hide on leave, and on press so the tooltip never sits over an opening dropdown.
    '(mouseleave)': 'hide()',
    '(mousedown)': 'hide()',
    '(focusout)': 'hide()',
  },
})
export class IvTruncateTooltip {
  readonly text = input<string | null | undefined>('', { alias: "ivTruncateTooltip" });
  readonly ivTruncateTooltipSide = input<TooltipSide>('top');
  /** Element whose clipping is checked; defaults to the host. Lets a wide hover area measure a narrower text span. */
  readonly ivTruncateTooltipMeasure = input<HTMLElement | null>(null);

  private el = inject(ElementRef) as ElementRef<HTMLElement>
  private overlay = inject(Overlay)
  private vcr = inject(ViewContainerRef)

  private overlayRef: OverlayRef | null = null
  private panel: ComponentRef<TooltipPanelComponent> | null = null
  private showTimer?: ReturnType<typeof setTimeout>

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.hide()
      this.overlayRef?.dispose()
      this.overlayRef = null
    })
  }

  get isTruncated(): boolean {
    const el = this.ivTruncateTooltipMeasure() ?? this.el.nativeElement
    return el.scrollWidth > el.clientWidth
  }

  show() {
    if (!this.text()?.trim() || !this.isTruncated) return
    clearTimeout(this.showTimer)
    this.showTimer = setTimeout(() => this.attach(), 200)
  }

  hide() {
    clearTimeout(this.showTimer)
    if (this.overlayRef?.hasAttached()) this.overlayRef.detach()
  }

  private attach() {
    if (this.overlayRef?.hasAttached()) return

    if (!this.overlayRef) {
      const strategy = this.overlay
        .position()
        .flexibleConnectedTo(this.el)
        .withPositions(connectedPositions(this.ivTruncateTooltipSide(), 'center', 6))
        .withFlexibleDimensions(false)
        .withPush(true)
      // data-side follows the side the panel really got, so a flip near an edge is reflected.
      strategy.positionChanges.subscribe(({ connectionPair }) => this.panel?.setInput('side', sideOf(connectionPair)))
      this.overlayRef = this.overlay.create({
        positionStrategy: strategy,
        scrollStrategy: this.overlay.scrollStrategies.close(),
        panelClass: ['iv-tooltip-overlay-panel'],
        hasBackdrop: false,
      })
    }

    this.panel = this.overlayRef.attach(new ComponentPortal(TooltipPanelComponent, this.vcr))
    this.panel.setInput('text', this.text() ?? '')
    this.panel.setInput('side', this.ivTruncateTooltipSide())
  }
}

/** The side of the trigger a connected position puts the panel on. */
function sideOf(pair: ConnectionPositionPair): TooltipSide {
  if (pair.originY === 'top' && pair.overlayY === 'bottom') return 'top'
  if (pair.originY === 'bottom' && pair.overlayY === 'top') return 'bottom'
  return pair.overlayX === 'end' ? 'left' : 'right'
}
