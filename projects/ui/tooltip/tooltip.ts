import { OverlayModule } from '@angular/cdk/overlay'
import {
  Component,
  Directive,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  Injectable,
  InjectionToken,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  Signal,
  computed,
  input
} from '@angular/core'

import {
  TooltipAlign,
  TooltipSide,
  tooltipArrowClasses,
  tooltipPanelClasses,
} from './tooltip-overlay'
import { IV_CONFIG, IvIdGenerator, cn, connectedPositions } from '@inlaylab/ivorie/core'

// ─── Config (scoped per provider, or falls back to global token) ──────────────

export const IV_TOOLTIP_DELAY = new InjectionToken<number>('IV_TOOLTIP_DELAY', {
  providedIn: 'root',
  factory: () => inject(IV_CONFIG).tooltipDelay ?? 0,
})

@Injectable()
export class IvTooltipConfig {
  // IvTooltipProvider replaces this with its input.
  delayDuration: Signal<number> = signal(0)
}

// ─── Provider ────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-tooltip-provider',
  standalone: true,
  providers: [IvTooltipConfig],
  host: { 'data-slot': 'tooltip-provider' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvTooltipProvider {
  private config = inject(IvTooltipConfig)

  readonly delayDuration = input(0)

  constructor() {
    this.config.delayDuration = this.delayDuration
  }
}

// ─── Root ────────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-tooltip',
  standalone: true,
  host: {
    'data-slot': 'tooltip',
    'class': 'inline-block',
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '(focusin)': 'onFocus()',
    '(focusout)': 'onLeave()',
    '(mousedown)': 'onPointerDown()',
    '(document:mouseup)': 'pointerDown = false',
    '(document:keydown.escape)': 'close()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvTooltip {
  private _globalDelay = inject(IV_TOOLTIP_DELAY)
  private _config = inject(IvTooltipConfig, { optional: true })

  readonly delayDuration = input<number>()

  readonly id = inject(IvIdGenerator).next('iv-tooltip')
  readonly isOpen = signal(false)
  /** IvTooltipContent puts its `hidden` input here: a hidden tooltip describes nothing. */
  contentHidden: Signal<boolean> = signal(false)
  // Focus that comes from a pointer press does not open the tooltip (Radix).
  pointerDown = false
  readonly triggerRef = signal<ElementRef<HTMLElement> | null>(null)

  private _openTimer?: ReturnType<typeof setTimeout>
  private _closeTimer?: ReturnType<typeof setTimeout>

  private get _delay(): number {
    const inputDelay = this.delayDuration()
    if (inputDelay !== undefined) return inputDelay
    if (this._config) return this._config.delayDuration()
    return this._globalDelay
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this._openTimer)
      clearTimeout(this._closeTimer)
    })
  }

  registerTrigger(ref: ElementRef<HTMLElement>) {
    this.triggerRef.set(ref)
  }

  onEnter() {
    clearTimeout(this._closeTimer)
    if (this._delay === 0) {
      this.isOpen.set(true)
    } else {
      this._openTimer = setTimeout(() => this.isOpen.set(true), this._delay)
    }
  }

  onFocus() {
    if (!this.pointerDown) this.onEnter()
  }

  onPointerDown() {
    this.pointerDown = true
    this.close()
  }

  onLeave() {
    clearTimeout(this._openTimer)
    this._closeTimer = setTimeout(() => this.isOpen.set(false), 100)
  }

  close() {
    clearTimeout(this._openTimer)
    clearTimeout(this._closeTimer)
    this.isOpen.set(false)
  }
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

@Directive({
  selector: '[ivTooltipTrigger]',
  standalone: true,
  host: {
    'data-slot': 'tooltip-trigger',
    '[attr.aria-describedby]': 'describedBy()',
    '(click)': 'onClick()',
  },
})
export class IvTooltipTrigger implements OnInit {
  private el = inject(ElementRef) as ElementRef<HTMLElement>
  protected parent = inject(IvTooltip)
  private ownDescribedBy = inject(new HostAttributeToken('aria-describedby'), { optional: true })

  readonly describedBy = computed(
    () =>
      [this.ownDescribedBy, this.parent.isOpen() && !this.parent.contentHidden() ? this.parent.id : null]
        .filter(Boolean)
        .join(' ') || null,
  )

  ngOnInit() {
    this.parent.registerTrigger(this.el)
  }

  onClick() {
    this.parent.close()
  }
}

// ─── Content ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'iv-tooltip-content',
  standalone: true,
  imports: [OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (parent.triggerRef()) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="parent.triggerRef()!"
        [cdkConnectedOverlayOpen]="parent.isOpen() && !hidden()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayHasBackdrop]="false"
        [cdkConnectedOverlayPanelClass]="['iv-tooltip-overlay-panel']"
      >
        <div
          [id]="parent.id"
          [class]="classes()"
          data-slot="tooltip-content"
          data-state="open"
          [attr.data-side]="side()"
          role="tooltip"
          (mouseenter)="parent.onEnter()"
          (mouseleave)="parent.onLeave()"
        >
          <ng-content />
          <span [class]="arrowClass()" [attr.data-side]="side()" aria-hidden="true"></span>
        </div>
      </ng-template>
    }
  `,
})
export class IvTooltipContent {
  readonly parent = inject(IvTooltip)

  readonly side = input<TooltipSide>('top');
  readonly align = input<TooltipAlign>('center');
  readonly sideOffset = input(6);
  readonly hidden = input(false);
  readonly class = input('');

  readonly positions = computed(() => connectedPositions(this.side(), this.align(), this.sideOffset()))
  readonly classes = computed(() => tooltipPanelClasses(this.class()))
  readonly arrowClass = computed(() => tooltipArrowClasses(this.side(), this.align()))

  constructor() {
    this.parent.contentHidden = this.hidden
  }
}

// ─── Barrel ──────────────────────────────────────────────────────────────────

export const IV_TOOLTIP_IMPORTS = [
  IvTooltipProvider,
  IvTooltip,
  IvTooltipTrigger,
  IvTooltipContent,
] as const
