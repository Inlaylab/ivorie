import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

/**
 * A key number with its context: an icon chip and a label on top, the value (and a delta) below, then
 * an optional sparkline or meter. Use it alone as a tile, or several in a row.
 */
@Component({
  selector: 'iv-stat',
  host: { 'data-slot': 'stat', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvStat {
  readonly class = input('')
  protected readonly classes = computed(() =>
    cn('cn-stat flex min-w-0 flex-col gap-3', this.class()),
  )
}

/** The top row: icon chip, label and an optional action at the end. */
@Component({
  selector: 'iv-stat-header',
  host: { 'data-slot': 'stat-header', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvStatHeader {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-stat-header flex min-w-0 items-center gap-2', this.class()))
}

/** A small square chip for the stat's icon. */
@Component({
  selector: 'iv-stat-icon',
  host: { 'data-slot': 'stat-icon', 'aria-hidden': 'true', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvStatIcon {
  readonly class = input('')
  protected readonly classes = computed(() =>
    cn(
      "cn-stat-icon flex size-8 shrink-0 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
      this.class(),
    ),
  )
}

/** What the number is, like "Revenue". */
@Component({
  selector: 'iv-stat-label',
  host: { 'data-slot': 'stat-label', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvStatLabel {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-stat-label min-w-0 flex-1 truncate', this.class()))
}

/** The number, with room for a delta after it. */
@Component({
  selector: 'iv-stat-value',
  host: { 'data-slot': 'stat-value', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvStatValue {
  readonly class = input('')
  protected readonly classes = computed(() =>
    cn('cn-stat-value flex flex-wrap items-baseline gap-2 tabular-nums', this.class()),
  )
}

/** A line of context under the value, like "vs. last month". */
@Component({
  selector: 'iv-stat-description',
  host: { 'data-slot': 'stat-description', '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
})
export class IvStatDescription {
  readonly class = input('')
  protected readonly classes = computed(() => cn('cn-stat-description', this.class()))
}

export const IV_STAT_IMPORTS = [IvStat, IvStatHeader, IvStatIcon, IvStatLabel, IvStatValue, IvStatDescription] as const
