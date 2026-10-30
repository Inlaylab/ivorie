
import { OverlayModule } from '@angular/cdk/overlay'
import {
  Component,
  Directive,
  ElementRef,
  Injectable,
  OnDestroy,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  Signal,
  computed,
  input
} from '@angular/core'
import { Align, IvIdGenerator, Side, cn, connectedPositions } from '@inlaylab/ivorie/core'

@Injectable()
export class IvHoverCardStore implements OnDestroy {
  readonly id = inject(IvIdGenerator).next('iv-hover-card')
  readonly isOpen = signal(false)
  readonly triggerRef = signal<ElementRef<HTMLElement> | null>(null)

  // IvHoverCard replaces these with its inputs.
  openDelay: Signal<number> = signal(200)
  closeDelay: Signal<number> = signal(150)

  private openTimer?: ReturnType<typeof setTimeout>
  private closeTimer?: ReturnType<typeof setTimeout>

  setTrigger(ref: ElementRef<HTMLElement>) {
    this.triggerRef.set(ref)
  }

  scheduleOpen() {
    clearTimeout(this.closeTimer)
    if (this.isOpen()) return
    this.openTimer = setTimeout(() => this.isOpen.set(true), this.openDelay())
  }

  scheduleClose() {
    clearTimeout(this.openTimer)
    if (!this.isOpen()) return
    this.closeTimer = setTimeout(() => this.isOpen.set(false), this.closeDelay())
  }

  cancelClose() {
    clearTimeout(this.closeTimer)
  }

  open() {
    clearTimeout(this.openTimer)
    clearTimeout(this.closeTimer)
    this.isOpen.set(true)
  }

  close() {
    clearTimeout(this.openTimer)
    clearTimeout(this.closeTimer)
    this.isOpen.set(false)
  }

  ngOnDestroy() {
    clearTimeout(this.openTimer)
    clearTimeout(this.closeTimer)
  }
}

@Component({
  selector: 'iv-hover-card',
  standalone: true,
  providers: [IvHoverCardStore],
  host: {
    'data-slot': 'hover-card',
    'class': 'inline-block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvHoverCard {
  private store = inject(IvHoverCardStore)

  readonly openDelay = input(200)
  readonly closeDelay = input(150)

  constructor() {
    this.store.openDelay = this.openDelay
    this.store.closeDelay = this.closeDelay
  }
}

@Directive({
  selector: '[ivHoverCardTrigger]',
  standalone: true,
  host: {
    'data-slot': 'hover-card-trigger',
    '(mouseenter)': 'onEnter()',
    '(mouseleave)': 'onLeave()',
    '(click)': 'onClick()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(document:keydown.escape)': 'store.isOpen() && store.close()',
    '[attr.data-state]': 'store.isOpen() ? "open" : "closed"',
    '[attr.aria-expanded]': 'store.isOpen()',
    '[attr.aria-controls]': 'store.isOpen() ? store.id : null',
  },
})
export class IvHoverCardTrigger implements OnInit {
  private el: ElementRef<HTMLElement> = inject(ElementRef)
  store = inject(IvHoverCardStore)

  ngOnInit() {
    this.store.setTrigger(this.el)
  }

  onEnter() {
    this.store.scheduleOpen()
  }

  onLeave() {
    this.store.scheduleClose()
  }

  onClick() {
    this.store.open()
  }

  onFocus() {
    this.store.scheduleOpen()
  }

  onBlur() {
    this.store.scheduleClose()
  }
}

@Component({
  selector: 'iv-hover-card-content',
  standalone: true,
  imports: [OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (originRef()) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="originRef()!"
        [cdkConnectedOverlayOpen]="store.isOpen()"
        [cdkConnectedOverlayPositions]="positions()"
        [cdkConnectedOverlayPanelClass]="['iv-hover-card-panel']"
      >
        <div
          [id]="store.id"
          data-slot="hover-card-content"
          [class]="classes()"
          [attr.data-side]="side()"
          [attr.data-state]="store.isOpen() ? 'open' : 'closed'"
          (mouseenter)="store.cancelClose()"
          (mouseleave)="store.scheduleClose()"
        >
          <ng-content />
        </div>
      </ng-template>
    }
  `,
})
export class IvHoverCardContent {
  store = inject(IvHoverCardStore)

  readonly side = input<Side>('bottom');
  readonly align = input<Align>('center');
  readonly sideOffset = input(8);
  readonly alignOffset = input(0);
  readonly class = input('');

  readonly originRef = this.store.triggerRef
  readonly positions = computed(() =>
    connectedPositions(this.side(), this.align(), this.sideOffset(), this.alignOffset()),
  )
  readonly classes = computed(() => cn('cn-hover-card-content z-50 outline-hidden', this.class()))
}

export const IV_HOVER_CARD_IMPORTS = [
  IvHoverCard,
  IvHoverCardTrigger,
  IvHoverCardContent,
] as const
