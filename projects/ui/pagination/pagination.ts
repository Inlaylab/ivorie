import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { LucideChevronLeft, LucideChevronRight, LucideEllipsis } from '@lucide/angular'
import { ButtonVariants, buttonVariants } from '@inlaylab/ivorie/button'
import { cn } from '@inlaylab/ivorie/core'

@Component({
  selector: 'nav[ivPagination]',
  standalone: true,
  host: {
    role: 'navigation',
    'aria-label': 'pagination',
    'data-slot': 'pagination',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPagination {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-pagination mx-auto flex w-full justify-center', this.class()))
}

@Component({
  selector: 'ul[ivPaginationContent]',
  standalone: true,
  host: {
    'data-slot': 'pagination-content',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPaginationContent {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-pagination-content flex items-center', this.class()))
}

@Component({
  selector: 'li[ivPaginationItem]',
  standalone: true,
  host: { 'data-slot': 'pagination-item' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPaginationItem {}

@Component({
  selector: 'a[ivPaginationLink]',
  standalone: true,
  host: {
    'data-slot': 'pagination-link',
    '[attr.aria-current]': 'isActive() ? "page" : null',
    '[attr.data-active]': 'isActive() ? "" : null',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvPaginationLink {
  readonly isActive = input(false)
  readonly size = input<ButtonVariants['size']>('icon')
  readonly class = input('')

  readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.isActive() ? 'outline' : 'ghost', size: this.size() }),
      'cn-pagination-link',
      this.class(),
    ),
  )
}

@Component({
  selector: 'a[ivPaginationPrevious]',
  standalone: true,
  imports: [LucideChevronLeft],
  host: {
    'data-slot': 'pagination-link',
    'aria-label': 'Go to previous page',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg lucideChevronLeft class="cn-rtl-flip"></svg>
    <span class="cn-pagination-previous-text hidden sm:block">{{ text() }}</span>
  `,
})
export class IvPaginationPrevious {
  readonly text = input('Previous')
  readonly class = input('')

  readonly classes = computed(() =>
    cn(buttonVariants({ variant: 'ghost', size: 'default' }), 'cn-pagination-previous', this.class()),
  )
}

@Component({
  selector: 'a[ivPaginationNext]',
  standalone: true,
  imports: [LucideChevronRight],
  host: {
    'data-slot': 'pagination-link',
    'aria-label': 'Go to next page',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="cn-pagination-next-text hidden sm:block">{{ text() }}</span>
    <svg lucideChevronRight class="cn-rtl-flip"></svg>
  `,
})
export class IvPaginationNext {
  readonly text = input('Next')
  readonly class = input('')

  readonly classes = computed(() =>
    cn(buttonVariants({ variant: 'ghost', size: 'default' }), 'cn-pagination-next', this.class()),
  )
}

@Component({
  selector: 'span[ivPaginationEllipsis]',
  standalone: true,
  imports: [LucideEllipsis],
  host: {
    'data-slot': 'pagination-ellipsis',
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg lucideEllipsis></svg>
    <span class="sr-only">More pages</span>
  `,
})
export class IvPaginationEllipsis {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-pagination-ellipsis flex items-center justify-center', this.class()))
}

export const IV_PAGINATION_IMPORTS = [
  IvPagination,
  IvPaginationContent,
  IvPaginationItem,
  IvPaginationLink,
  IvPaginationPrevious,
  IvPaginationNext,
  IvPaginationEllipsis,
] as const
