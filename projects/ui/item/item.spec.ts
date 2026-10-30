import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { describe, expect, it } from 'vitest'
import { IV_ITEM_IMPORTS, ItemVariants, itemVariants } from '@inlaylab/ivorie/item'

@Component({
  imports: [IV_ITEM_IMPORTS],
  template: `
    <iv-item-group>
      <iv-item id="i" [variant]="variant()" [size]="size()" class="max-w-md">
        <iv-item-header>Head</iv-item-header>
        <iv-item-media variant="icon">*</iv-item-media>
        <iv-item-content>
          <iv-item-title>Title</iv-item-title>
          <p ivItemDescription>Text</p>
        </iv-item-content>
        <iv-item-actions>Act</iv-item-actions>
        <iv-item-footer>Foot</iv-item-footer>
      </iv-item>
      <iv-item-separator />
      <iv-item id="j">Second</iv-item>
    </iv-item-group>
    <iv-item-group>
      <div><iv-item id="nested">Wrapped</iv-item></div>
    </iv-item-group>
    <iv-item id="alone">Alone</iv-item>
  `,
})
class Host {
  variant = signal<ItemVariants['variant']>('default')
  size = signal<ItemVariants['size']>('default')
}

async function setup() {
  const fixture = TestBed.createComponent(Host)
  await fixture.whenStable()
  const el = (sel: string) => fixture.nativeElement.querySelector(sel) as HTMLElement
  return { fixture, el }
}

describe('IvItem', () => {
  it('exports itemVariants', () => {
    expect(itemVariants({ variant: 'muted' })).toContain('cn-item-variant-muted')
  })

  it.each([
    ['iv-item-group', 'cn-item-group'],
    ['iv-item-header', 'cn-item-header'],
    ['iv-item-media', 'cn-item-media-variant-icon'],
    ['iv-item-content', 'cn-item-content'],
    ['iv-item-title', 'cn-item-title'],
    ['p[ivItemDescription]', 'cn-item-description'],
    ['iv-item-actions', 'cn-item-actions'],
    ['iv-item-footer', 'cn-item-footer'],
    ['iv-item-separator', 'cn-item-separator'],
  ])('%s has hook %s', async (sel, hook) => {
    const { el } = await setup()
    expect(el(sel).classList).toContain(hook)
  })

  it('switches variant and size hooks and data attributes', async () => {
    const { fixture, el } = await setup()
    const i = el('#i')
    expect(i.classList).toContain('cn-item-variant-default')
    expect(i.classList).toContain('max-w-md')
    fixture.componentInstance.variant.set('outline')
    fixture.componentInstance.size.set('sm')
    await fixture.whenStable()
    expect(i.classList).toContain('cn-item-variant-outline')
    expect(i.classList).toContain('cn-item-size-sm')
    expect(i.dataset['variant']).toBe('outline')
    expect(i.dataset['size']).toBe('sm')
  })

  it('items are listitems only as direct children of a group', async () => {
    const { el } = await setup()
    expect(el('iv-item-group').getAttribute('role')).toBe('list')
    expect(el('#i').getAttribute('role')).toBe('listitem')
    expect(el('#alone').hasAttribute('role')).toBe(false)
    expect(el('#nested').hasAttribute('role')).toBe(false)
  })

  // The wrapped group is misuse on purpose (a list with no listitems), so axe checks the valid one.
  it('has no axe violations', async () => {
    const { el } = await setup()
    await expect(el('iv-item-group')).toHaveNoViolations()
    await expect(el('#alone')).toHaveNoViolations()
  })
})
