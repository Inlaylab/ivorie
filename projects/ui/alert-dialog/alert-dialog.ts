import { NgTemplateOutlet } from '@angular/common'
import { CdkTrapFocus } from '@angular/cdk/a11y'
import {
  AfterViewInit,
  Component,
  Directive,
  Injector,
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
import {
  AlertDialogCloseEvent,
  AlertDialogConfig,
  IvAlertDialogRef,
  IvAlertDialog,
} from './alert-dialog.service'
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core'
import { ButtonVariants, buttonVariants } from '@inlaylab/ivorie/button'

@Component({
  selector: 'iv-alert-dialog-container',
  standalone: true,
  imports: [NgTemplateOutlet, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      data-slot="alert-dialog-content"
      role="alertdialog"
      aria-modal="true"
      data-state="open"
      [attr.aria-labelledby]="titleId()"
      [attr.aria-describedby]="descriptionId()"
      [attr.data-size]="config.size || 'default'"
      [class]="contentClasses"
      cdkTrapFocus
    >
      @if (template) {
        <ng-container *ngTemplateOutlet="template; context: templateContext; injector: dialogInjector"
         />
      }
      <ng-container #dynamicHost />
    </div>
  `,
})
export class IvAlertDialogContainer implements AfterViewInit {
  readonly dynamicHost = viewChild.required('dynamicHost', { read: ViewContainerRef });
  // Initial focus by hand: auto-capture would also restore focus at dispose, after afterClosed.
  private readonly trap = viewChild.required(CdkTrapFocus)

  readonly dialogInjector = inject(Injector)

  template?: TemplateRef<unknown>
  component?: Type<unknown>
  config: AlertDialogConfig = {}
  dialogRef!: IvAlertDialogRef
  /** Set by IvAlertDialogTitle / IvAlertDialogDescription. */
  readonly titleId = signal<string | null>(null)
  readonly descriptionId = signal<string | null>(null)

  get templateContext() {
    return { $implicit: this.dialogRef, data: this.config.data, dialogRef: this.dialogRef }
  }

  readonly contentClasses =
    'cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none'

  ngAfterViewInit() {
    this.trap().focusTrap.focusInitialElementWhenReady()
    if (this.component) {
      const ref = this.dynamicHost().createComponent(this.component)
      this.dialogRef.componentInstance = ref.instance
    }
  }

  onEscape(event: KeyboardEvent) {
    if (this.config.disableEscapeClose) return
    event.preventDefault()
    this.dialogRef.close(undefined, 'escape')
  }
}

@Directive({
  selector: '[ivAlertDialogTrigger]',
  standalone: true,
  host: { 'data-slot': 'alert-dialog-trigger', '(click)': 'open()' },
})
export class IvAlertDialogTrigger<T = unknown, R = unknown, D = unknown> {
  private service = inject(IvAlertDialog)

  readonly content = input.required<Type<T> | TemplateRef<unknown>>({ alias: "ivAlertDialogTrigger" });
  readonly ivAlertDialogConfig = input<AlertDialogConfig<D>>({});

  readonly opened = output<IvAlertDialogRef<T, R>>();
  readonly closed = output<AlertDialogCloseEvent<R>>();

  open() {
    const content = this.content();
    if (!content) return
    const ref = this.service.open<T, R, D>(content, this.ivAlertDialogConfig())
    this.opened.emit(ref)
    ref.afterClosed().subscribe((event) => this.closed.emit(event))
  }
}

@Component({
  selector: 'iv-alert-dialog-header',
  standalone: true,
  host: {
    'data-slot': 'alert-dialog-header',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertDialogHeader {
  readonly class = input('');

  readonly classes = computed(() => cn('cn-alert-dialog-header', this.class()))
}

@Component({
  selector: 'iv-alert-dialog-footer',
  standalone: true,
  host: {
    'data-slot': 'alert-dialog-footer',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertDialogFooter {
  readonly class = input('');

  readonly classes = computed(() =>
    cn(
      'cn-alert-dialog-footer flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end',
      this.class(),
    ),
  )
}

@Component({
  selector: 'iv-alert-dialog-media',
  standalone: true,
  host: {
    'data-slot': 'alert-dialog-media',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertDialogMedia {
  readonly class = input('');

  readonly classes = computed(() => cn('cn-alert-dialog-media', this.class()))
}

@Component({
  selector: 'iv-alert-dialog-title',
  standalone: true,
  host: {
    'data-slot': 'alert-dialog-title',
    '[id]': 'id',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertDialogTitle {
  readonly id = inject(IvIdGenerator).next('iv-alert-dialog-title')
  readonly class = input('');
  readonly classes = computed(() => cn('cn-alert-dialog-title', this.class()))

  constructor() {
    inject(IvAlertDialogContainer, { optional: true })?.titleId.set(this.id)
  }
}

@Component({
  selector: 'iv-alert-dialog-description',
  standalone: true,
  host: {
    'data-slot': 'alert-dialog-description',
    '[id]': 'id',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAlertDialogDescription {
  readonly id = inject(IvIdGenerator).next('iv-alert-dialog-description')
  readonly class = input('');
  readonly classes = computed(() => cn('cn-alert-dialog-description', this.class()))

  constructor() {
    inject(IvAlertDialogContainer, { optional: true })?.descriptionId.set(this.id)
  }
}

@Directive({
  selector: 'button[ivAlertDialogAction]',
  standalone: true,
  host: {
    'type': 'button',
    'data-slot': 'alert-dialog-action',
    '[class]': 'classes()',
    '(click)': 'onClick()',
  },
})
export class IvAlertDialogAction<R = unknown> {
  private dialogRef = inject<IvAlertDialogRef<unknown, R>>(IvAlertDialogRef, { optional: true })!

  readonly result = input<R>(undefined, { alias: "ivAlertDialogAction" });
  readonly variant = input<ButtonVariants['variant']>('default')
  readonly size = input<ButtonVariants['size']>('default')
  readonly class = input('')

  readonly classes = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), 'cn-alert-dialog-action', this.class()),
  )

  onClick() {
    this.dialogRef?.close(this.result(), 'action')
  }
}

@Directive({
  selector: 'button[ivAlertDialogCancel]',
  standalone: true,
  host: {
    'type': 'button',
    'data-slot': 'alert-dialog-cancel',
    // Radix: the least destructive choice gets initial focus.
    'cdkFocusInitial': '',
    '[class]': 'classes()',
    '(click)': 'onClick()',
  },
})
export class IvAlertDialogCancel<R = unknown> {
  private dialogRef = inject<IvAlertDialogRef<unknown, R>>(IvAlertDialogRef, { optional: true })!

  readonly result = input<R>(undefined, { alias: "ivAlertDialogCancel" });
  readonly variant = input<ButtonVariants['variant']>('outline')
  readonly size = input<ButtonVariants['size']>('default')
  readonly class = input('')

  readonly classes = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), 'cn-alert-dialog-cancel', this.class()),
  )

  onClick() {
    this.dialogRef?.close(this.result(), 'cancel')
  }
}

export const IV_ALERT_DIALOG_IMPORTS = [
  IvAlertDialogContainer,
  IvAlertDialogTrigger,
  IvAlertDialogHeader,
  IvAlertDialogFooter,
  IvAlertDialogMedia,
  IvAlertDialogTitle,
  IvAlertDialogDescription,
  IvAlertDialogAction,
  IvAlertDialogCancel,
] as const
