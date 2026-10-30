/**
 * Shared contract between the `iv-select-picker` trigger and its picker dialog.
 *
 * The trigger resolves `valueFn` / `labelFn` / `descriptionFn` against its items *before*
 * opening the dialog, so the dialog only ever deals with flat rows. That keeps the accessor
 * functions out of the dialog's change detection entirely.
 */
export interface SelectPickerRow {
  value: string;
  label: string;
  description?: string;
}

export interface SelectPickerDialogData {
  rows: SelectPickerRow[];
  selectedValues: string[];
  title: string;
  description?: string;
  searchPlaceholder: string;
  valueColumnHeader: string;
  descriptionColumnHeader?: string;
  /** Save stays disabled until at least this many rows are ticked. */
  minSelection: number;
  emptyMessage: string;
}
