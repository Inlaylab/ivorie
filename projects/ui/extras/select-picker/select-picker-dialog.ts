import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { LucideSearch } from '@lucide/angular'
import { IvButton } from '@inlaylab/ivorie/button'
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card'
import { IvCheckbox } from '@inlaylab/ivorie/checkbox'
import { IV_DIALOG_DATA, IV_DIALOG_IMPORTS, IvDialogRef } from '@inlaylab/ivorie/dialog'
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input'
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table'
import { SelectPickerDialogData, SelectPickerRow } from './select-picker.model'

/**
 * Picker half of `iv-select-picker`: a searchable checkbox table.
 *
 * Selection lives in the dialog and only goes back to the caller on Save, so Cancel is a true
 * discard.
 */
@Component({
  selector: 'iv-select-picker-dialog',
  standalone: true,
  templateUrl: './select-picker-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideSearch, IvButton, IvCheckbox, IV_CARD_IMPORTS, IV_DIALOG_IMPORTS, IV_INPUT_IMPORTS, IV_TABLE_IMPORTS],
})
export class IvSelectPickerDialog {
  private readonly dialogRef = inject<IvDialogRef<IvSelectPickerDialog, string[]>>(IvDialogRef)
  private readonly data = inject<Partial<SelectPickerDialogData> | null>(IV_DIALOG_DATA)

  readonly rows: readonly SelectPickerRow[] = (this.data?.rows ?? []).filter((row) => !!row?.value)

  readonly title = this.data?.title || 'Select items'
  readonly description = this.data?.description ?? ''
  readonly searchPlaceholder = this.data?.searchPlaceholder || 'Search'
  readonly valueColumnHeader = this.data?.valueColumnHeader || 'Name'
  readonly descriptionColumnHeader = this.data?.descriptionColumnHeader ?? ''
  readonly emptyMessage = this.data?.emptyMessage || 'No data found'
  readonly minSelection = this.data?.minSelection ?? 0

  /** Rows are fixed for the dialog's life, so these are plain values. */
  readonly showDescriptionColumn = this.rows.some((row) => !!row.description)
  readonly columnCount = this.showDescriptionColumn ? 3 : 2

  readonly search = signal('')
  private readonly selected = signal<ReadonlySet<string>>(new Set(this.data?.selectedValues ?? []))

  readonly filteredRows = computed(() => {
    const text = this.search().trim().toLowerCase()
    if (!text) return this.rows
    return this.rows.filter(
      (row) => row.label?.toLowerCase().includes(text) || row.description?.toLowerCase().includes(text),
    )
  })

  readonly selectedCount = computed(() => this.selected().size)
  readonly canSave = computed(() => this.selectedCount() >= this.minSelection)

  /** Ticked when every visible row is selected. */
  readonly allFilteredSelected = computed(() => {
    const rows = this.filteredRows()
    return rows.length > 0 && rows.every((row) => this.selected().has(row.value))
  })

  readonly someFilteredSelected = computed(
    () => !this.allFilteredSelected() && this.filteredRows().some((row) => this.selected().has(row.value)),
  )

  isSelected(value: string): boolean {
    return this.selected().has(value)
  }

  toggleRow(value: string, selected: boolean) {
    this.setSelected([value], selected)
  }

  /** Select-all applies to the filtered rows only, so it composes with the search box. */
  toggleAllFiltered(selected: boolean) {
    this.setSelected(
      this.filteredRows().map((row) => row.value),
      selected,
    )
  }

  onDismiss() {
    this.dialogRef.close()
  }

  onSave() {
    // Source row order, not click order, so the stored array is stable. A value with no row
    // cannot be unticked here, so it is kept (after the rows).
    const selected = this.selected()
    const known = new Set(this.rows.map((row) => row.value))
    this.dialogRef.close([
      ...this.rows.filter((row) => selected.has(row.value)).map((row) => row.value),
      ...[...selected].filter((value) => !known.has(value)),
    ])
  }

  private setSelected(values: string[], selected: boolean) {
    const next = new Set(this.selected())
    for (const value of values) {
      if (selected) next.add(value)
      else next.delete(value)
    }
    this.selected.set(next)
  }
}
