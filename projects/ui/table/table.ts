import { ChangeDetectionStrategy, Component, Directive, computed, input } from '@angular/core'
import { cn } from '@inlaylab/ivorie/core'

/** The host is the scroll container; `class` and `layout` style the inner `<table>`. */
@Component({
  selector: 'iv-table',
  standalone: true,
  host: {
    'data-slot': 'table-container',
    class: 'cn-table-container block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<table data-slot="table" [class]="classes()"><ng-content /></table>`,
})
export class IvTable {
  readonly class = input('')
  readonly layout = input<'auto' | 'fixed'>('auto')

  readonly classes = computed(() => cn('cn-table', this.layout() === 'fixed' && 'table-fixed', this.class()))
}

/** Shared by the native table element directives: base classes (hook first) + user class. */
@Directive({ host: { '[class]': 'classes()' } })
abstract class IvTablePart {
  protected abstract readonly base: string
  readonly class = input('')
  readonly classes = computed(() => cn(this.base, this.class()))
}

@Directive({ selector: 'thead[ivTableHeader]', standalone: true, host: { 'data-slot': 'table-header' } })
export class IvTableHeader extends IvTablePart {
  protected readonly base = 'cn-table-header'
}

@Directive({ selector: 'tbody[ivTableBody]', standalone: true, host: { 'data-slot': 'table-body' } })
export class IvTableBody extends IvTablePart {
  protected readonly base = 'cn-table-body'
}

@Directive({ selector: 'tfoot[ivTableFooter]', standalone: true, host: { 'data-slot': 'table-footer' } })
export class IvTableFooter extends IvTablePart {
  protected readonly base = 'cn-table-footer'
}

@Directive({ selector: 'tr[ivTableRow]', standalone: true, host: { 'data-slot': 'table-row' } })
export class IvTableRow extends IvTablePart {
  protected readonly base = 'cn-table-row has-aria-expanded:bg-muted/50'
}

@Directive({ selector: 'th[ivTableHead]', standalone: true, host: { 'data-slot': 'table-head' } })
export class IvTableHead extends IvTablePart {
  protected readonly base = 'cn-table-head'
}

@Directive({ selector: 'td[ivTableCell]', standalone: true, host: { 'data-slot': 'table-cell' } })
export class IvTableCell extends IvTablePart {
  protected readonly base = 'cn-table-cell'
}

@Directive({ selector: 'caption[ivTableCaption]', standalone: true, host: { 'data-slot': 'table-caption' } })
export class IvTableCaption extends IvTablePart {
  protected readonly base = 'cn-table-caption'
}

export const IV_TABLE_IMPORTS = [
  IvTable,
  IvTableHeader,
  IvTableBody,
  IvTableFooter,
  IvTableRow,
  IvTableHead,
  IvTableCell,
  IvTableCaption,
] as const
