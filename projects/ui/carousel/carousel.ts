import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'
import { LucideArrowLeft, LucideArrowRight } from '@lucide/angular'
import { ButtonVariants, buttonVariants } from '@inlaylab/ivorie/button'
import { cn } from '@inlaylab/ivorie/core'

/** Slides in a CSS scroll-snap track: touch, trackpad and wheel scrolling come from the browser. */
@Component({
  selector: 'iv-carousel',
  host: {
    'role': 'region',
    'aria-roledescription': 'carousel',
    'data-slot': 'carousel',
    '[attr.data-orientation]': 'orientation()',
    '[class]': 'classes()',
    '(keydown)': 'onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCarousel {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal')
  readonly class = input('')

  /** Set by IvCarouselContent. */
  viewport: HTMLElement | null = null
  readonly canPrev = signal(false)
  readonly canNext = signal(false)

  protected readonly classes = computed(() => cn('relative block', this.class()))

  /** Reads the scroll position; called on scroll and after render. */
  update() {
    const v = this.viewport
    if (!v) return
    const horizontal = this.orientation() === 'horizontal'
    const pos = horizontal ? v.scrollLeft : v.scrollTop
    const max = horizontal ? v.scrollWidth - v.clientWidth : v.scrollHeight - v.clientHeight
    // 1px slack: fractional scroll offsets never reach max exactly.
    this.canPrev.set(pos > 1)
    this.canNext.set(pos < max - 1)
  }

  /** Scrolls one viewport length; snap points settle on the next slide. */
  scroll(step: 1 | -1) {
    const v = this.viewport
    if (!v) return
    const horizontal = this.orientation() === 'horizontal'
    const by = (horizontal ? v.clientWidth : v.clientHeight) * step
    v.scrollBy(horizontal ? { left: by, behavior: 'smooth' } : { top: by, behavior: 'smooth' })
  }

  protected onKeydown(event: KeyboardEvent) {
    const step = ({ ArrowLeft: -1, ArrowRight: 1 } as Record<string, 1 | -1>)[event.key]
    if (!step || this.orientation() !== 'horizontal') return
    event.preventDefault()
    this.scroll(step)
  }
}

@Component({
  selector: 'iv-carousel-content',
  host: { 'class': 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #viewport
      class="no-scrollbar overscroll-contain [scrollbar-width:none]"
      [class]="carousel.orientation() === 'horizontal' ? 'snap-x snap-mandatory overflow-x-auto' : 'h-full snap-y snap-mandatory overflow-y-auto'"
      (scroll)="carousel.update()"
    >
      <div data-slot="carousel-content" [class]="classes()"><ng-content /></div>
    </div>
  `,
})
export class IvCarouselContent {
  protected readonly carousel = inject(IvCarousel)
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport')
  readonly class = input('')

  protected readonly classes = computed(() =>
    cn('flex', this.carousel.orientation() === 'horizontal' ? '-ml-4' : '-mt-4 h-full flex-col', this.class())
  )

  constructor() {
    afterNextRender(() => {
      this.carousel.viewport = this.viewport().nativeElement
      this.carousel.update()
    })
  }
}

@Component({
  selector: 'iv-carousel-item',
  host: {
    'role': 'group',
    'aria-roledescription': 'slide',
    'data-slot': 'carousel-item',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvCarouselItem {
  private readonly carousel = inject(IvCarousel)
  readonly class = input('')

  protected readonly classes = computed(() =>
    cn('block min-w-0 shrink-0 grow-0 basis-full snap-start', this.carousel.orientation() === 'horizontal' ? 'pl-4' : 'pt-4', this.class())
  )
}

const NAV_POSITION = {
  previous: { horizontal: 'top-1/2 -left-12 -translate-y-1/2', vertical: '-top-12 left-1/2 -translate-x-1/2 rotate-90' },
  next: { horizontal: 'top-1/2 -right-12 -translate-y-1/2', vertical: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90' },
}

/** Shared by the previous and next buttons: button look, position by orientation. */
@Directive()
abstract class IvCarouselNav {
  protected readonly carousel = inject(IvCarousel)
  readonly variant = input<ButtonVariants['variant']>('outline')
  readonly size = input<ButtonVariants['size']>('icon-sm')
  readonly class = input('')
  protected abstract readonly kind: 'previous' | 'next'

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.size() }),
      `cn-carousel-${this.kind} absolute touch-manipulation`,
      NAV_POSITION[this.kind][this.carousel.orientation()],
      this.class()
    )
  )
}

@Component({
  selector: 'button[ivCarouselPrevious]',
  imports: [LucideArrowLeft],
  host: {
    'type': 'button',
    'data-slot': 'carousel-previous',
    '[disabled]': '!carousel.canPrev()',
    '[class]': 'classes()',
    '(click)': 'carousel.scroll(-1)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg lucideArrowLeft class="cn-rtl-flip" aria-hidden="true"></svg><span class="sr-only">Previous slide</span>`,
})
export class IvCarouselPrevious extends IvCarouselNav {
  protected readonly kind = 'previous'
}

@Component({
  selector: 'button[ivCarouselNext]',
  imports: [LucideArrowRight],
  host: {
    'type': 'button',
    'data-slot': 'carousel-next',
    '[disabled]': '!carousel.canNext()',
    '[class]': 'classes()',
    '(click)': 'carousel.scroll(1)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg lucideArrowRight class="cn-rtl-flip" aria-hidden="true"></svg><span class="sr-only">Next slide</span>`,
})
export class IvCarouselNext extends IvCarouselNav {
  protected readonly kind = 'next'
}

export const IV_CAROUSEL_IMPORTS = [IvCarousel, IvCarouselContent, IvCarouselItem, IvCarouselPrevious, IvCarouselNext] as const
