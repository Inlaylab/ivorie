import { Component, LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import { IvBarList, type IvBarListItem } from '@inlaylab/ivorie/bar-list'

@Component({
  imports: [IvBarList],
  template: `<iv-bar-list [data]="data()" [sort]="sort()" [format]="format" aria-label="Top pages" />`,
})
class Host {
  data = signal<IvBarListItem[]>([
    { name: '/pricing', value: 300 },
    { name: '/', value: 1200, href: '/' },
    { name: '/docs', value: 600 },
  ])
  sort = signal<'descending' | 'ascending' | 'none'>('descending')
  format = (v: number) => `${v} views`
}

async function setup(sort: 'descending' | 'ascending' | 'none' = 'descending') {
  const fixture = TestBed.createComponent(Host)
  fixture.componentInstance.sort.set(sort)
  await fixture.whenStable()
  const el = fixture.nativeElement.querySelector('[data-slot="bar-list"]') as HTMLElement
  const rows = [...el.querySelectorAll<HTMLElement>('[data-slot="bar-list-row"]')]
  return { el, rows }
}

describe('IvBarList', () => {
  it('a list of rows, largest first, bars sized against the largest, numbers formatted', async () => {
    const { el, rows } = await setup()
    expect(el.getAttribute('role')).toBe('list')
    expect(rows.map((r) => r.getAttribute('role'))).toEqual(['listitem', 'listitem', 'listitem'])
    expect(rows.map((r) => r.querySelector('[data-slot="bar-list-label"]')!.textContent!.trim())).toEqual(['/', '/docs', '/pricing'])
    expect(rows.map((r) => (r.querySelector('[data-slot="bar-list-bar"]') as HTMLElement).style.width)).toEqual(['100%', '50%', '25%'])
    expect(rows[0].querySelector('[data-slot="bar-list-value"]')!.textContent!.trim()).toBe('1200 views')
    expect(rows[0].querySelector('a')!.getAttribute('href')).toBe('/')
    expect(rows[1].querySelector('a')).toBeNull()
    await expect(el).toHaveNoViolations()
  })

  it('sort="ascending" and "none"', async () => {
    const names = async (sort: 'ascending' | 'none') =>
      (await setup(sort)).rows.map((r) => r.querySelector('[data-slot="bar-list-label"]')!.textContent!.trim())
    expect(await names('ascending')).toEqual(['/pricing', '/docs', '/'])
    expect(await names('none')).toEqual(['/pricing', '/', '/docs'])
  })

  it('two rows with the same name both render, without a duplicate-key warning on update', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fixture = TestBed.createComponent(Host)
    fixture.componentInstance.data.set([{ name: 'Direct', value: 5 }, { name: 'Direct', value: 3 }])
    await fixture.whenStable()
    fixture.componentInstance.data.set([{ name: 'Direct', value: 2 }, { name: 'Direct', value: 9 }, { name: 'Ads', value: 1 }])
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelectorAll('[data-slot="bar-list-row"]').length).toBe(3)
    expect(warn.mock.calls.flat().join(' ')).not.toMatch(/NG0955/)
    warn.mockRestore()
  })

  it('the default number format follows the app locale (LOCALE_ID)', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }] })
    TestBed.overrideTemplate(Host, `<iv-bar-list [data]="[{ name: 'Direct', value: 1250 }]" aria-label="Sources" />`)
    const fixture = TestBed.createComponent(Host)
    await fixture.whenStable()
    expect(fixture.nativeElement.querySelector('[data-slot="bar-list-value"]').textContent.trim()).toBe('1.250')
  })
})
