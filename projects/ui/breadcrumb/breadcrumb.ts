import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { LucideChevronRight, LucideEllipsis } from '@lucide/angular'
import { cn } from '@inlaylab/ivorie/core'

@Component({
  selector: 'nav[ivBreadcrumb]',
  standalone: true,
  host: {
    'aria-label': 'breadcrumb',
    'data-slot': 'breadcrumb',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvBreadcrumb {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-breadcrumb', this.class()))
}

@Component({
  selector: 'ol[ivBreadcrumbList]',
  standalone: true,
  host: {
    'data-slot': 'breadcrumb-list',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvBreadcrumbList {
  readonly class = input('')
  readonly classes = computed(() =>
    cn('cn-breadcrumb-list flex flex-wrap items-center wrap-break-word', this.class()),
  )
}

@Component({
  selector: 'li[ivBreadcrumbItem]',
  standalone: true,
  host: {
    'data-slot': 'breadcrumb-item',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvBreadcrumbItem {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-breadcrumb-item inline-flex items-center', this.class()))
}

@Component({
  selector: 'a[ivBreadcrumbLink]',
  standalone: true,
  host: {
    'data-slot': 'breadcrumb-link',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvBreadcrumbLink {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-breadcrumb-link', this.class()))
}

/** The current page: a link that goes nowhere (Radix / shadcn markup). */
@Component({
  selector: 'span[ivBreadcrumbPage]',
  standalone: true,
  host: {
    'data-slot': 'breadcrumb-page',
    role: 'link',
    'aria-disabled': 'true',
    'aria-current': 'page',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvBreadcrumbPage {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-breadcrumb-page', this.class()))
}

@Component({
  selector: 'li[ivBreadcrumbSeparator]',
  standalone: true,
  imports: [LucideChevronRight],
  host: {
    'data-slot': 'breadcrumb-separator',
    role: 'presentation',
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    @if (showDefault()) {
      <svg lucideChevronRight class="cn-rtl-flip"></svg>
    }
  `,
})
export class IvBreadcrumbSeparator {
  readonly class = input('')
  /** Set to `false` when you project your own separator. */
  readonly showDefault = input(true)
  readonly classes = computed(() => cn('cn-breadcrumb-separator', this.class()))
}

@Component({
  selector: 'span[ivBreadcrumbEllipsis]',
  standalone: true,
  imports: [LucideEllipsis],
  host: {
    'data-slot': 'breadcrumb-ellipsis',
    role: 'presentation',
    'aria-hidden': 'true',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg lucideEllipsis></svg>
    <span class="sr-only">More</span>
  `,
})
export class IvBreadcrumbEllipsis {
  readonly class = input('')
  readonly classes = computed(() => cn('cn-breadcrumb-ellipsis flex items-center justify-center', this.class()))
}

export const IV_BREADCRUMB_IMPORTS = [
  IvBreadcrumb,
  IvBreadcrumbList,
  IvBreadcrumbItem,
  IvBreadcrumbLink,
  IvBreadcrumbPage,
  IvBreadcrumbSeparator,
  IvBreadcrumbEllipsis,
] as const
