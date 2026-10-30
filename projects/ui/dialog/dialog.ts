import { NgTemplateOutlet } from '@angular/common'
import { CdkTrapFocus } from '@angular/cdk/a11y'
import {
  AfterViewInit,
  Component,
  Directive,
  Injector,
  OnDestroy,
  TemplateRef,
  Type,
  ViewContainerRef,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
  viewChild
} from '@angular/core'
import { LucideX } from '@lucide/angular'
import { IvButton } from '@ivorie/ui/button'
import {
  DialogCloseEvent,
  DialogCloseReason,
  DialogConfig,
  IvDialogRef,
  IvDialog,
} from './dialog.service'
import { IvIdGenerator, cn } from '@ivorie/ui/core'

@Component({
  selector: 'iv-dialog-container',
  standalone: true,
  imports: [NgTemplateOutlet, CdkTrapFocus, LucideX, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="dialog-content"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="config.ariaLabel || null"
      [attr.aria-labelledby]="labelledBy()"
      [attr.aria-describedby]="config.ariaDescribedBy || descriptionId() || null"
      [attr.data-state]="dataState()"
      [attr.data-size]="config.size || 'default'"
      [attr.data-height]="config.height || 'auto'"
      [class]="contentClasses"
      cdkTrapFocus
    >
      @if (template) {
        <ng-container *ngTemplateOutlet="template; context: templateContext; injector: dialogInjector"
         />
      }
      <ng-container #dynamicHost />

      @if (showCloseButton) {
        <button ivButton
          type="button"
          variant="ghost"
          size="icon-sm"
          class="cn-dialog-close"
          data-slot="dialog-close"
          (click)="onCloseButton()"
        >
          <svg lucideX></svg>
          <span class="sr-only">Close</span>
        </button>
      }
    </div>
  `,
})
export class IvDialogContainer implements AfterViewInit {
  readonly dynamicHost = viewChild.required('dynamicHost', { read: ViewContainerRef });
  // Initial focus by hand: auto-capture would also restore focus at dispose, after afterClosed.
  private readonly trap = viewChild.required(CdkTrapFocus)

  readonly dialogInjector = inject(Injector)

  template?: TemplateRef<unknown>
  component?: Type<unknown>
  config: DialogConfig = {}
  dialogRef!: IvDialogRef
  readonly dataState = signal<'open' | 'closed'>('open')
  /** Set by IvDialogTitle / IvDialogDescription. */
  readonly titleId = signal<string | null>(null)
  readonly descriptionId = signal<string | null>(null)

  // An explicit aria-label replaces the default title reference.
  readonly labelledBy = computed(
    () => this.config.ariaLabelledBy || (this.config.ariaLabel ? null : this.titleId()),
  )


  get showCloseButton() {
    return this.config.showCloseButton !== false
  }

  get templateContext() {
    return { $implicit: this.dialogRef, data: this.config.data, dialogRef: this.dialogRef }
  }

  // Sizes and the flex column (so iv-dialog-body can scroll) override the hook's grid / max-w-md.
  readonly contentClasses = cn(
      'cn-dialog-content relative z-50 flex flex-col w-full outline-none overflow-hidden min-w-0',
      'max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)]',
      'data-[size=sm]:sm:w-sm',
      'data-[size=default]:sm:w-md',
      'data-[size=lg]:sm:w-lg data-[size=lg]:md:w-2xl',
      'data-[size=xl]:sm:w-xl data-[size=xl]:md:w-3xl data-[size=xl]:lg:w-4xl',
      'data-[size=fit]:w-fit',
      'data-[height=tall]:h-[min(34rem,calc(100dvh-2rem))]',
    )

  ngAfterViewInit() {
    this.trap().focusTrap.focusInitialElementWhenReady()
    if (this.component) {
      const ref = this.dynamicHost().createComponent(this.component)
      ;(ref.location.nativeElement as HTMLElement).classList.add('contents')
      this.dialogRef.componentInstance = ref.instance
    }
  }

  beginClose() {
    this.dataState.set('closed')
  }

  onCloseButton() {
    this.dialogRef.close(undefined, 'close-button')
  }

  onEscape(event: KeyboardEvent) {
    if (this.config.disableEscapeClose) return
    event.preventDefault()
    this.dialogRef.close(undefined, 'escape')
  }
}

@Directive({
  selector: '[ivDialogTrigger]',
  standalone: true,
  host: { 'data-slot': 'dialog-trigger', '(click)': 'open()' },
})
export class IvDialogTrigger<T = unknown, R = unknown, D = unknown> implements OnDestroy {
  private dialog = inject(IvDialog)
  private ref?: IvDialogRef<T, R>

  readonly content = input.required<Type<T> | TemplateRef<unknown>>({ alias: "ivDialogTrigger" });
  readonly ivDialogConfig = input<DialogConfig<D>>({});

  readonly opened = output<IvDialogRef<T, R>>();
  readonly closed = output<DialogCloseEvent<R>>();

  open() {
    const content = this.content();
    if (!content) return
    const ref = this.dialog.open<T, R, D>(content, this.ivDialogConfig())
    this.ref = ref
    this.opened.emit(ref)
    ref.afterClosed().subscribe((event) => this.closed.emit(event))
  }

  // A trigger removed from the DOM (e.g. an @if, or a route change) while its dialog is still
  // open would otherwise leave that dialog open forever, with no way back to this trigger.
  ngOnDestroy() {
    this.ref?.close(undefined, 'navigation')
  }
}

@Component({
  selector: 'iv-dialog-header',
  standalone: true,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div data-slot="dialog-header" [class]="classes()"><ng-content /></div>`,
})
export class IvDialogHeader {
  readonly class = input('');
  readonly classes = computed(() => cn('cn-dialog-header flex flex-col shrink-0', this.class()))
}

@Component({
  selector: 'iv-dialog-title',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2 data-slot="dialog-title" [id]="id" [class]="classes()"><ng-content /></h2>`,
})
export class IvDialogTitle {
  readonly id = inject(IvIdGenerator).next('iv-dialog-title')
  readonly class = input('');
  readonly classes = computed(() => cn('cn-dialog-title', this.class()))

  constructor() {
    inject(IvDialogContainer, { optional: true })?.titleId.set(this.id)
  }
}

@Component({
  selector: 'iv-dialog-description',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p data-slot="dialog-description" [id]="id" [class]="classes()">
      @if (innerHTML(); as html) {
        <span [innerHTML]="html"></span>
      } @else {
        <ng-content />
      }
    </p>
  `,
})
export class IvDialogDescription {
  readonly class = input('');
  readonly innerHTML = input<string>()
  readonly id = inject(IvIdGenerator).next('iv-dialog-description')
  readonly classes = computed(() => cn('cn-dialog-description', this.class()))

  constructor() {
    inject(IvDialogContainer, { optional: true })?.descriptionId.set(this.id)
  }
}

@Component({
  selector: 'iv-dialog-body',
  standalone: true,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div data-slot="dialog-body" [class]="classes()"><ng-content /></div>`,
})
export class IvDialogBody {
  readonly class = input('');
  readonly classes = computed(() =>
    cn('flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 -mx-6 px-6', this.class()),
  )
}

@Component({
  selector: 'iv-dialog-footer',
  standalone: true,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div data-slot="dialog-footer" [class]="classes()"><ng-content /></div>`,
})
export class IvDialogFooter {
  readonly class = input('');
  readonly classes = computed(() =>
    cn('cn-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end shrink-0', this.class()),
  )
}

@Directive({
  selector: '[ivDialogClose]',
  standalone: true,
  host: { 'data-slot': 'dialog-close', '(click)': 'onClick()' },
})
export class IvDialogClose<R = unknown> {
  private dialogRef = inject<IvDialogRef<unknown, R>>(IvDialogRef, { optional: true })!

  readonly result = input<R>(undefined, { alias: "ivDialogClose" });
  readonly reason = input<DialogCloseReason>('close-button');

  onClick() {
    this.dialogRef?.close(this.result(), this.reason())
  }
}

export const IV_DIALOG_IMPORTS = [
  IvDialogContainer,
  IvDialogTrigger,
  IvDialogHeader,
  IvDialogTitle,
  IvDialogDescription,
  IvDialogBody,
  IvDialogFooter,
  IvDialogClose,
] as const
