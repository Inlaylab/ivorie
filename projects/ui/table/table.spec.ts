import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_TABLE_IMPORTS } from './table'

@Component({
  imports: [IV_TABLE_IMPORTS],
  template: `
    <iv-table [layout]="layout()" class="extra">
      <caption ivTableCaption>Invoices</caption>
      <thead ivTableHeader>
        <tr ivTableRow>
          <th ivTableHead>Invoice</th>
          <th ivTableHead>Amount</th>
        </tr>
      </thead>
      <tbody ivTableBody>
        <tr ivTableRow class="row-extra">
          <td ivTableCell>INV001</td>
          <td ivTableCell>$250.00</td>
        </tr>
      </tbody>
      <tfoot ivTableFooter>
        <tr ivTableRow>
          <td ivTableCell>Total</td>
          <td ivTableCell>$250.00</td>
        </tr>
      </tfoot>
    </iv-table>
  `,
})
class Host {
  layout = signal<'auto' | 'fixed'>('auto')
}

async function render() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const slot = (name: string) => el.querySelector<HTMLElement>(`[data-slot="${name}"]`)!
  return { fixture, host: fixture.componentInstance, el, slot }
}

describe('IvTable', () => {
  it('every part has its data-slot and hook', async () => {
    const { slot } = await render()
    for (const part of ['container', 'header', 'body', 'footer', 'row', 'head', 'cell', 'caption'])
      expect(slot(`table-${part}`).classList).toContain(`cn-table-${part}`)
    expect(slot('table').tagName).toBe('TABLE')
    expect(slot('table').classList).toContain('cn-table')
  })

  it('container wraps the table; user class goes on the <table>', async () => {
    const { slot } = await render()
    expect(slot('table-container').tagName).toBe('IV-TABLE')
    expect(slot('table').parentElement).toBe(slot('table-container'))
    expect(slot('table').classList).toContain('extra')
  })

  it('layout="fixed" adds table-fixed', async () => {
    const { fixture, host, slot } = await render()
    expect(slot('table').classList).not.toContain('table-fixed')
    host.layout.set('fixed')
    await fixture.whenStable()
    expect(slot('table').classList).toContain('table-fixed')
  })

  it('user class on a row merges with the hook', async () => {
    const { el } = await render()
    const row = el.querySelector<HTMLElement>('.row-extra')!
    expect(row.classList).toContain('cn-table-row')
  })

  it('axe passes', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
