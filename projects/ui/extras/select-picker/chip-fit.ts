/** Gap between chips (`gap-1`). */
export const CHIP_GAP_PX = 4
/** Trigger padding plus the chevron, which the chip row shares the line with. */
export const TRIGGER_CHROME_PX = 44

/**
 * How many chips fit on one line, greedily, leaving room for the "+N more" chip whenever chips
 * remain. Always at least one (it truncates). Before layout (`containerWidth` 0, or widths not
 * yet measured for every chip) it returns `widths.length` so nothing is hidden by mistake.
 */
export function fitChips(containerWidth: number, widths: readonly number[], overflowWidth: number, total = widths.length): number {
  if (!total) return 0
  if (!containerWidth || widths.length !== total) return total

  const budget = containerWidth - TRIGGER_CHROME_PX
  let used = 0
  let fitted = 0

  for (let i = 0; i < total; i++) {
    const next = used + widths[i] + (i > 0 ? CHIP_GAP_PX : 0)
    // Every chip but the last must also leave room for the "+N more" chip.
    const required = i < total - 1 ? next + CHIP_GAP_PX + overflowWidth : next
    if (required > budget) break
    used = next
    fitted++
  }

  return Math.max(1, fitted)
}
