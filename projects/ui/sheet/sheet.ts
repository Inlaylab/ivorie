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
} from '@angular/core'
import { IvIcon } from '@inlaylab/ivorie/icon'
import { IvButton } from '@inlaylab/ivorie/button'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'
import {
  DialogCloseEvent,
  DialogCloseReason,
  DialogConfig,
  IvDialog,
  IvDialogContainer,
  IvDialogRef,
} from '@inlaylab/ivorie/dialog'

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'

export interface SheetConfig<D = unknown> extends Omit<DialogConfig<D>, 'size' | 'height'> {
  /** Edge the sheet docks to. Default `right`. */
  side?: SheetSide
}

/** A dialog docked to an edge. Close and focus behave as in IvDialog. */
@Component({
  selector: 'iv-sheet-container',
  imports: [NgTemplateOutlet, CdkTrapFocus, IvButton, IvIcon],
  // Sheet title and description register with the container like the dialog ones.
  providers: [{ provide: IvDialogContainer, useExisting: IvSheetContainer }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="sheet-content"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="config.ariaLabel || null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="config.ariaDescribedBy || descriptionId() || null"
      [attr.data-state]="dataState()"
      [attr.data-side]="side"
      [class]="contentClasses"
      cdkTrapFocus
    >
      @if (template) {
        <ng-container *ngTemplateOutlet="template; context: templateContext; injector: dialogInjector" />
      }
      <ng-container #dynamicHost />
      @if (showCloseButton) {
        <button ivButton type="button" variant="ghost" size="icon-sm" class="cn-sheet-close" data-slot="sheet-close" (click)="onCloseButton()">
          <svg ivIcon="x"></svg>
          <span class="sr-only">Close</span>
        </button>
      }
    </div>
  `,
})
export class IvSheetContainer extends IvDialogContainer {
  override readonly contentClasses = cn(
    'cn-sheet-content outline-none data-open:animate-in data-open:fade-in-0 data-[side=bottom]:data-open:slide-in-from-bottom-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:animate-out data-closed:fade-out-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=right]:data-closed:slide-out-to-right-10 data-[side=top]:data-closed:slide-out-to-top-10',
  )

  get side(): SheetSide {
    return (this.config as SheetConfig).side ?? 'right'
  }
}

@Injectable({ providedIn: 'root' })
export class IvSheet {
  private readonly dialog = inject(IvDialog)

  open<T = unknown, R = unknown, D = unknown>(
    content: Type<T> | TemplateRef<unknown>,
    config: SheetConfig<D> = {},
  ): IvDialogRef<T, R> {
    return this.dialog.open<T, R, D>(content, config, { container: IvSheetContainer, overlayClass: 'cn-sheet-overlay' })
  }
}

@Directive({
  selector: '[ivSheetTrigger]',
  host: { 'data-slot': 'sheet-trigger', '(click)': 'open()' },
})
export class IvSheetTrigger<T = unknown, R = unknown, D = unknown> implements OnDestroy {
  private readonly sheet = inject(IvSheet)
  private ref?: IvDialogRef<T, R>

  readonly content = input.required<Type<T> | TemplateRef<unknown>>({ alias: 'ivSheetTrigger' })
  readonly ivSheetConfig = input<SheetConfig<D>>({})

  readonly opened = output<IvDialogRef<T, R>>()
  readonly closed = output<DialogCloseEvent<R>>()

  open() {
    const ref = this.sheet.open<T, R, D>(this.content(), this.ivSheetConfig())
    this.ref = ref
    this.opened.emit(ref)
    ref.afterClosed().subscribe((event) => this.closed.emit(event))
  }

  // Same as the dialog trigger: a removed trigger must not leave its sheet open.
  ngOnDestroy() {
    this.ref?.close(undefined, 'navigation')
  }
}

@Component({
  selector: 'iv-sheet-header',
  host: { 'data-slot': 'sheet-header', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSheetHeader {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-sheet-header flex flex-col', this.class()))
}

@Component({
  selector: 'iv-sheet-footer',
  host: { 'data-slot': 'sheet-footer', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvSheetFooter {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-sheet-footer mt-auto flex flex-col', this.class()))
}

@Component({
  selector: 'iv-sheet-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2 data-slot="sheet-title" [id]="id" [class]="classes()"><ng-content /></h2>`,
})
export class IvSheetTitle {
  readonly id = inject(IvIdGenerator).next('iv-sheet-title')
  readonly class = input('')
  readonly classes = computed(() => cn('cn-sheet-title cn-font-heading', this.class()))

  constructor() {
    inject(IvDialogContainer, { optional: true })?.titleId.set(this.id)
  }
}

@Component({
  selector: 'iv-sheet-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p data-slot="sheet-description" [id]="id" [class]="classes()"><ng-content /></p>`,
})
export class IvSheetDescription {
  readonly id = inject(IvIdGenerator).next('iv-sheet-description')
  readonly class = input('')
  readonly classes = computed(() => cn('cn-sheet-description', this.class()))

  constructor() {
    inject(IvDialogContainer, { optional: true })?.descriptionId.set(this.id)
  }
}

@Directive({
  selector: '[ivSheetClose]',
  host: { 'data-slot': 'sheet-close', '(click)': 'onClick()' },
})
export class IvSheetClose<R = unknown> {
  private readonly ref = inject<IvDialogRef<unknown, R>>(IvDialogRef, { optional: true })

  readonly result = input<R>(undefined, { alias: 'ivSheetClose' })
  readonly reason = input<DialogCloseReason>('close-button')

  onClick() {
    this.ref?.close(this.result(), this.reason())
  }
}

export const IV_SHEET_IMPORTS = [
  IvSheetContainer,
  IvSheetTrigger,
  IvSheetHeader,
  IvSheetFooter,
  IvSheetTitle,
  IvSheetDescription,
  IvSheetClose,
] as const
