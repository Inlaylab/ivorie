import { NgTemplateOutlet } from '@angular/common'
import { CdkTrapFocus } from '@angular/cdk/a11y'
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  Injectable,
  OnDestroy,
  TemplateRef,
  Type,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'
import {
  DialogCloseEvent,
  DialogCloseReason,
  DialogConfig,
  IvDialog,
  IvDialogContainer,
  IvDialogRef,
} from '@inlaylab/ivorie/dialog'

export type DrawerDirection = 'top' | 'right' | 'bottom' | 'left'

export interface DrawerConfig<D = unknown> extends Omit<DialogConfig<D>, 'size' | 'height' | 'showCloseButton'> {
  /** Edge the drawer comes from. Default `bottom`. */
  direction?: DrawerDirection
}

/** Share of the drawer's size a drag must pass to close it. */
const CLOSE_THRESHOLD = 0.25

/** A sheet you can drag toward its edge to close. */
@Component({
  selector: 'iv-drawer-container',
  imports: [NgTemplateOutlet, CdkTrapFocus],
  providers: [{ provide: IvDialogContainer, useExisting: IvDrawerContainer }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="drawer-content"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="config.ariaLabel || null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="config.ariaDescribedBy || descriptionId() || null"
      [attr.data-state]="dataState()"
      [attr.data-vaul-drawer-direction]="direction"
      [style.transform]="dragTransform()"
      [style.transition]="dragging() ? 'none' : null"
      [class]="contentClasses"
      cdkTrapFocus
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
    >
      <div class="cn-drawer-handle mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block"></div>
      @if (template) {
        <ng-container *ngTemplateOutlet="template; context: templateContext; injector: dialogInjector" />
      }
      <ng-container #dynamicHost />
    </div>
  `,
})
export class IvDrawerContainer extends IvDialogContainer {
  override readonly contentClasses = cn(
    'cn-drawer-content group/drawer-content fixed z-50 flex flex-col outline-none touch-none data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm'
  )

  /** Drag distance toward the closing edge, in px; never negative. */
  readonly offset = signal(0)
  readonly dragging = signal(false)
  private start: { x: number; y: number } | null = null

  get direction(): DrawerDirection {
    return (this.config as DrawerConfig).direction ?? 'bottom'
  }

  private get vertical() {
    return this.direction === 'top' || this.direction === 'bottom'
  }

  protected readonly dragTransform = computed(() => {
    const d = this.offset()
    if (!d) return null
    const sign = this.direction === 'bottom' || this.direction === 'right' ? 1 : -1
    return this.direction === 'top' || this.direction === 'bottom' ? `translateY(${sign * d}px)` : `translateX(${sign * d}px)`
  })

  protected onPointerDown(event: PointerEvent) {
    // Form controls and links keep their own pointer behavior.
    if (event.button !== 0 || (event.target as HTMLElement).closest('input, textarea, select, button, a, [contenteditable]')) return
    this.start = { x: event.clientX, y: event.clientY }
    this.dragging.set(true)
    ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  }

  protected onPointerMove(event: PointerEvent) {
    if (!this.start) return
    const delta = this.vertical ? event.clientY - this.start.y : event.clientX - this.start.x
    const toward = this.direction === 'bottom' || this.direction === 'right' ? delta : -delta
    this.offset.set(Math.max(0, toward))
  }

  protected onPointerUp(event: PointerEvent) {
    if (!this.start) return
    this.start = null
    this.dragging.set(false)
    const el = event.currentTarget as HTMLElement
    el.releasePointerCapture?.(event.pointerId)
    const rect = el.getBoundingClientRect()
    const size = (this.vertical ? rect.height : rect.width) || 1
    if (this.offset() / size > CLOSE_THRESHOLD) this.dialogRef.close(undefined, 'drag')
    else this.offset.set(0)
  }
}

@Injectable({ providedIn: 'root' })
export class IvDrawer {
  private readonly dialog = inject(IvDialog)

  open<T = unknown, R = unknown, D = unknown>(
    content: Type<T> | TemplateRef<unknown>,
    config: DrawerConfig<D> = {},
  ): IvDialogRef<T, R> {
    return this.dialog.open<T, R, D>(content, { ...config, showCloseButton: false }, {
      container: IvDrawerContainer,
      overlayClass: 'cn-drawer-overlay',
    })
  }
}

@Directive({
  selector: '[ivDrawerTrigger]',
  host: { 'data-slot': 'drawer-trigger', '(click)': 'open()' },
})
export class IvDrawerTrigger<T = unknown, R = unknown, D = unknown> implements OnDestroy {
  private readonly drawer = inject(IvDrawer)
  private ref?: IvDialogRef<T, R>

  readonly content = input.required<Type<T> | TemplateRef<unknown>>({ alias: 'ivDrawerTrigger' })
  readonly ivDrawerConfig = input<DrawerConfig<D>>({})

  readonly opened = output<IvDialogRef<T, R>>()
  readonly closed = output<DialogCloseEvent<R>>()

  open() {
    const ref = this.drawer.open<T, R, D>(this.content(), this.ivDrawerConfig())
    this.ref = ref
    this.opened.emit(ref)
    ref.afterClosed().subscribe((event) => this.closed.emit(event))
  }

  // Same as the dialog trigger: a removed trigger must not leave its drawer open.
  ngOnDestroy() {
    this.ref?.close(undefined, 'navigation')
  }
}

@Component({
  selector: 'iv-drawer-header',
  host: { 'data-slot': 'drawer-header', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDrawerHeader {
  readonly class = input('')
  readonly classes = computed(() =>
    cn(
      'cn-drawer-header flex flex-col group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center',
      this.class()
    )
  )
}

@Component({
  selector: 'iv-drawer-footer',
  host: { 'data-slot': 'drawer-footer', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvDrawerFooter {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-drawer-footer mt-auto flex flex-col', this.class()))
}

@Component({
  selector: 'iv-drawer-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2 data-slot="drawer-title" [id]="id" [class]="classes()"><ng-content /></h2>`,
})
export class IvDrawerTitle {
  readonly id = inject(IvIdGenerator).next('iv-drawer-title')
  readonly class = input('')
  readonly classes = computed(() => cn('cn-drawer-title cn-font-heading', this.class()))

  constructor() {
    inject(IvDialogContainer, { optional: true })?.titleId.set(this.id)
  }
}

@Component({
  selector: 'iv-drawer-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p data-slot="drawer-description" [id]="id" [class]="classes()"><ng-content /></p>`,
})
export class IvDrawerDescription {
  readonly id = inject(IvIdGenerator).next('iv-drawer-description')
  readonly class = input('')
  readonly classes = computed(() => cn('cn-drawer-description', this.class()))

  constructor() {
    inject(IvDialogContainer, { optional: true })?.descriptionId.set(this.id)
  }
}

@Directive({
  selector: '[ivDrawerClose]',
  host: { 'data-slot': 'drawer-close', '(click)': 'onClick()' },
})
export class IvDrawerClose<R = unknown> {
  private readonly ref = inject<IvDialogRef<unknown, R>>(IvDialogRef, { optional: true })

  readonly result = input<R>(undefined, { alias: 'ivDrawerClose' })
  readonly reason = input<DialogCloseReason>('close-button')

  onClick() {
    this.ref?.close(this.result(), this.reason())
  }
}

export const IV_DRAWER_IMPORTS = [
  IvDrawerContainer,
  IvDrawerTrigger,
  IvDrawerHeader,
  IvDrawerFooter,
  IvDrawerTitle,
  IvDrawerDescription,
  IvDrawerClose,
] as const
