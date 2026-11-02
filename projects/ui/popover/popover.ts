import { CdkTrapFocus } from '@angular/cdk/a11y'
import { OverlayModule } from '@angular/cdk/overlay'
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injectable,
  Injector,
  OnInit,
  WritableSignal,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core'
import { Align, IvIdGenerator, Side, cn, connectedPositions } from '@inlaylab/ivorie/core'

@Injectable()
export class IvPopoverStore {
  readonly id = inject(IvIdGenerator).next('iv-popover')
  // IvPopover replaces this with its `open` model.
  isOpen: WritableSignal<boolean> = signal(false)
  readonly triggerRef = signal<ElementRef<HTMLElement> | null>(null)
  /** Set by IvPopoverTitle; labels the content. */
  readonly titleId = signal<string | null>(null)
  /** Anchor set by `[ivPopoverAnchor]`; else the trigger. */
  readonly anchorRef = signal<ElementRef<HTMLElement> | null>(null)

  toggle() {
    this.isOpen.set(!this.isOpen())
  }

  /** Closes and puts focus back on the trigger, unless focus already moved elsewhere. */
  close() {
    if (!this.isOpen()) return
    this.isOpen.set(false)
    const trigger = this.triggerRef()?.nativeElement
    const active = trigger?.ownerDocument.activeElement
    if (trigger && (!active || active === trigger.ownerDocument.body || active.closest('[data-slot="popover-content"]'))) {
      trigger.focus()
    }
  }
}

@Component({
  selector: 'iv-popover',
  providers: [IvPopoverStore],
  host: { 'data-slot': 'popover', 'class': 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPopover {
  readonly open = model(false)

  constructor() {
    inject(IvPopoverStore).isOpen = this.open
  }
}

@Directive({
  selector: '[ivPopoverTrigger]',
  host: {
    'data-slot': 'popover-trigger',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'store.isOpen()',
    '[attr.aria-controls]': 'store.isOpen() ? store.id : null',
    '[attr.data-state]': 'store.isOpen() ? "open" : "closed"',
    '(click)': 'store.toggle()',
  },
})
export class IvPopoverTrigger implements OnInit {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  protected readonly store = inject(IvPopoverStore)

  ngOnInit() {
    this.store.triggerRef.set(this.el)
  }
}

/** Positions the content against this element instead of the trigger. */
@Directive({
  selector: '[ivPopoverAnchor]',
  host: { 'data-slot': 'popover-anchor' },
})
export class IvPopoverAnchor implements OnInit {
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef)
  private readonly store = inject(IvPopoverStore)

  ngOnInit() {
    this.store.anchorRef.set(this.el)
  }
}

@Component({
  selector: 'iv-popover-content',
  imports: [OverlayModule, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (origin()) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin()!"
        [cdkConnectedOverlayOpen]="store.isOpen()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
        [cdkConnectedOverlayPanelClass]="['iv-popover-panel']"
        (backdropClick)="store.close()"
        (detach)="store.close()"
        (attach)="onAttach()"
      >
        <div
          role="dialog"
          tabindex="-1"
          data-slot="popover-content"
          data-state="open"
          #panel
          cdkTrapFocus
          [attr.aria-labelledby]="store.titleId()"
          (keydown.escape)="store.close()"
          [id]="store.id"
          [attr.data-side]="side()"
          [attr.data-align]="align()"
          [class]="classes()"
        >
          <ng-content />
        </div>
      </ng-template>
    }
  `,
})
export class IvPopoverContent {
  protected readonly store = inject(IvPopoverStore)

  readonly side = input<Side>('bottom')
  readonly align = input<Align>('center')
  readonly sideOffset = input(4)
  readonly alignOffset = input(0)
  readonly class = input('')

  private readonly injector = inject(Injector)
  private readonly trap = viewChild(CdkTrapFocus)
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel')

  protected readonly origin = computed(() => this.store.anchorRef() ?? this.store.triggerRef())
  protected readonly positions = computed(() =>
    connectedPositions(this.side(), this.align(), this.sideOffset(), this.alignOffset())
  )
  protected readonly classes = computed(() => cn('cn-popover-content z-50 w-72 outline-hidden', this.class()))

  // First tabbable element, else the panel itself (Radix does the same).
  protected onAttach() {
    afterNextRender(
      () => {
        this.trap()?.focusTrap.focusInitialElementWhenReady().then((moved) => {
          if (!moved) this.panel()?.nativeElement.focus()
        })
      },
      { injector: this.injector },
    )
  }
}

@Component({
  selector: 'iv-popover-header',
  host: { 'data-slot': 'popover-header', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPopoverHeader {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-popover-header', this.class()))
}

@Component({
  selector: 'iv-popover-title',
  host: { 'data-slot': 'popover-title', '[id]': 'id', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPopoverTitle {
  readonly id = inject(IvIdGenerator).next('iv-popover-title')
  readonly class = input('')

  constructor() {
    inject(IvPopoverStore, { optional: true })?.titleId.set(this.id)
  }
  readonly classes = computed(() => cn('cn-popover-title block', this.class()))
}

@Component({
  selector: 'iv-popover-description',
  host: { 'data-slot': 'popover-description', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPopoverDescription {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-popover-description block', this.class()))
}

export const IV_POPOVER_IMPORTS = [
  IvPopover,
  IvPopoverTrigger,
  IvPopoverAnchor,
  IvPopoverContent,
  IvPopoverHeader,
  IvPopoverTitle,
  IvPopoverDescription,
] as const
