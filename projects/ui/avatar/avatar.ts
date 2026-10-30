import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

export type AvatarImageState = 'loading' | 'loaded' | 'error'

@Component({
  selector: 'iv-avatar',
  host: {
    'data-slot': 'avatar',
    '[attr.data-size]': 'size()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAvatar {
  readonly size = input<'default' | 'sm' | 'lg'>('default');
  readonly class = input('');

  /** Load state of the child image. The fallback shows until it is 'loaded'. */
  readonly imageState = signal<AvatarImageState>('loading')

  protected readonly classes = computed(() =>
    cn(
      'cn-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten',
      this.class(),
    )
  )
}

@Component({
  selector: 'iv-avatar-image',
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img
    #img
    data-slot="avatar-image"
    [src]="src()"
    [alt]="alt()"
    [hidden]="state() !== 'loaded'"
    [class]="classes()"
    (load)="setState('loaded')"
    (error)="setState('error')"
  />`,
})
export class IvAvatarImage {
  // Shared with the fallback through the parent avatar; local when used alone.
  protected readonly state = inject(IvAvatar, { optional: true })?.imageState ?? signal<AvatarImageState>('loading')
  private img = viewChild.required<ElementRef<HTMLImageElement>>('img')

  readonly src = input.required<string>();
  readonly alt = input('');
  readonly class = input('');

  protected readonly classes = computed(() => cn('cn-avatar-image aspect-square size-full object-cover', this.class()))

  constructor() {
    // With SSR the image can finish before hydration, so its load event is missed. Read it once.
    afterNextRender(() => {
      const img = this.img().nativeElement
      if (img.complete) this.setState(img.naturalWidth > 0 ? 'loaded' : 'error')
    })
  }

  protected setState(state: AvatarImageState) {
    this.state.set(state)
  }
}

@Component({
  selector: 'iv-avatar-fallback',
  host: {
    'data-slot': 'avatar-fallback',
    '[hidden]': 'avatar?.imageState() === "loaded"',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAvatarFallback {
  protected avatar = inject(IvAvatar, { optional: true })

  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs',
      this.class(),
    )
  )
}

@Component({
  selector: 'iv-avatar-badge',
  host: {
    'data-slot': 'avatar-badge',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAvatarBadge {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'cn-avatar-badge absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none',
      'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
      'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
      'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
      this.class(),
    )
  )
}

@Component({
  selector: 'iv-avatar-group',
  host: {
    'data-slot': 'avatar-group',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAvatarGroup {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn(
      'cn-avatar-group group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
      this.class(),
    )
  )
}

@Component({
  selector: 'iv-avatar-group-count',
  host: {
    'data-slot': 'avatar-group-count',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvAvatarGroupCount {
  readonly class = input('');

  protected readonly classes = computed(() =>
    cn('cn-avatar-group-count relative flex shrink-0 items-center justify-center ring-2 ring-background', this.class())
  )
}

export const IV_AVATAR_IMPORTS = [
  IvAvatar,
  IvAvatarImage,
  IvAvatarFallback,
  IvAvatarBadge,
  IvAvatarGroup,
  IvAvatarGroupCount,
] as const
