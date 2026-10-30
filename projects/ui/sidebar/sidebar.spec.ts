import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { InteractivityChecker } from '@angular/cdk/a11y'
import { BreakpointObserver } from '@angular/cdk/layout'
import { BehaviorSubject } from 'rxjs'
import { Injectable } from '@angular/core'
import { afterEach, describe, expect, it } from 'vitest'
import { provideIvorie } from '@ivorie/ui/core'
import { IV_SIDEBAR_IMPORTS, sidebarMenuButtonVariants } from './sidebar'

@Component({
  imports: [IV_SIDEBAR_IMPORTS],
  template: `
    <iv-sidebar-provider [defaultOpen]="defaultOpen()" [cookieName]="cookieName()">
      <iv-sidebar [variant]="variant()" [collapsible]="collapsible()" [side]="side()" class="sidebar-extra">
        <iv-sidebar-header>Acme</iv-sidebar-header>
        <iv-sidebar-content>
          <iv-sidebar-group>
            <iv-sidebar-group-label>Platform</iv-sidebar-group-label>
            <iv-sidebar-group-action>+</iv-sidebar-group-action>
            <iv-sidebar-group-content>
              <ul ivSidebarMenu>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button [isActive]="true" size="lg" tooltip="Home">Home</iv-sidebar-menu-button>
                  <iv-sidebar-menu-action [showOnHover]="true">…</iv-sidebar-menu-action>
                  <iv-sidebar-menu-badge>3</iv-sidebar-menu-badge>
                </li>
                <li ivSidebarMenuItem>
                  <iv-sidebar-menu-button variant="outline">Inbox</iv-sidebar-menu-button>
                  <ul ivSidebarMenuSub>
                    <li ivSidebarMenuSubItem><a ivSidebarMenuSubButton href="#u" size="sm" [isActive]="true">Unread</a></li>
                  </ul>
                </li>
                <li ivSidebarMenuItem><iv-sidebar-menu-skeleton [showIcon]="true" /></li>
                <li ivSidebarMenuItem><iv-sidebar-menu-skeleton /></li>
              </ul>
            </iv-sidebar-group-content>
          </iv-sidebar-group>
          <iv-sidebar-separator />
        </iv-sidebar-content>
        <iv-sidebar-footer>Me</iv-sidebar-footer>
        <iv-sidebar-rail />
      </iv-sidebar>
      <main ivSidebarInset>
        <iv-sidebar-trigger />
        <a href="#page">Page</a>
      </main>
    </iv-sidebar-provider>
  `,
})
class Host {
  defaultOpen = signal(true)
  cookieName = signal('sidebar_state')
  variant = signal<'sidebar' | 'floating' | 'inset'>('sidebar')
  collapsible = signal<'offcanvas' | 'icon' | 'none'>('icon')
  side = signal<'left' | 'right'>('left')
}

// No tabbable content at all inside the drawer, unlike Host above.
@Component({
  imports: [IV_SIDEBAR_IMPORTS],
  template: `
    <iv-sidebar-provider>
      <iv-sidebar>
        <iv-sidebar-content>Nothing tabbable here.</iv-sidebar-content>
      </iv-sidebar>
      <main ivSidebarInset>
        <iv-sidebar-trigger />
        <a href="#page">Page</a>
      </main>
    </iv-sidebar-provider>
  `,
})
class EmptyHost {}

// jsdom has no layout, so CDK sees no element as visible and the focus trap finds nothing to focus.
@Injectable()
class VisibleChecker extends InteractivityChecker {
  override isVisible() {
    return true
  }
}

async function render(opts: { mobile?: boolean; setup?: (h: Host) => void; host?: new () => unknown } = {}) {
  const viewport = new BehaviorSubject({ matches: !!opts.mobile, breakpoints: {} })
  TestBed.configureTestingModule({
    providers: [
      provideIvorie({ sidebarMobile: opts.mobile ?? false }),
      { provide: InteractivityChecker, useClass: VisibleChecker },
      // jsdom has no matchMedia: report the viewport the test asks for.
      { provide: BreakpointObserver, useValue: { observe: () => viewport } },
    ],
  })
  const fixture = TestBed.createComponent((opts.host ?? Host) as new () => Host)
  opts.setup?.(fixture.componentInstance)
  await fixture.whenStable()
  const el = fixture.nativeElement as HTMLElement
  const slot = (name: string) => el.querySelector<HTMLElement>(`[data-slot="${name}"]`)!
  const stable = async () => {
    await fixture.whenStable()
    await new Promise((r) => setTimeout(r))
  }
  const trigger = () => slot('sidebar-trigger').querySelector('button')!
  const key = async (target: EventTarget, init: KeyboardEventInit) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
    await stable()
  }
  return { fixture, host: fixture.componentInstance, el, slot, stable, trigger, key, viewport }
}

describe('IvSidebar', () => {
  afterEach(() => {
    document.cookie = 'sidebar_state=; path=/; max-age=0'
    document.cookie = 'docs_nav=; path=/; max-age=0'
  })

  it('saves the state in the sidebar_state cookie, and a saved cookie wins over defaultOpen', async () => {
    const { trigger, stable } = await render()
    trigger().click()
    await stable()
    expect(document.cookie).toContain('sidebar_state=false')
    TestBed.resetTestingModule()
    const again = await render()
    expect(again.slot('sidebar').dataset['state']).toBe('collapsed')
  })

  it('cookieName="" neither reads nor writes a cookie', async () => {
    document.cookie = 'sidebar_state=false; path=/'
    const { slot, trigger, stable } = await render({ setup: (h) => h.cookieName.set('') })
    expect(slot('sidebar').dataset['state']).toBe('expanded')
    trigger().click()
    await stable()
    expect(slot('sidebar').dataset['state']).toBe('collapsed')
    expect(document.cookie).toContain('sidebar_state=false')
    expect(document.cookie).not.toContain('sidebar_state=true')
    trigger().click()
    await stable()
    // Expanding again would have written true; the pre-set cookie is untouched.
    expect(document.cookie).not.toContain('sidebar_state=true')
  })

  it('a custom cookieName keeps two sidebars apart', async () => {
    document.cookie = 'sidebar_state=false; path=/'
    document.cookie = 'docs_nav=true; path=/'
    const { slot, trigger, stable } = await render({ setup: (h) => h.cookieName.set('docs_nav') })
    expect(slot('sidebar').dataset['state']).toBe('expanded')
    trigger().click()
    await stable()
    expect(document.cookie).toContain('docs_nav=false')
  })

  it('data attributes on the sidebar follow its inputs and state', async () => {
    const { slot, trigger, stable } = await render({ setup: (h) => h.variant.set('floating') })
    const sidebar = slot('sidebar')
    expect(sidebar.dataset['state']).toBe('expanded')
    expect(sidebar.dataset['collapsible']).toBe('')
    expect(sidebar.dataset['variant']).toBe('floating')
    expect(sidebar.dataset['side']).toBe('left')
    trigger().click()
    await stable()
    expect(sidebar.dataset['state']).toBe('collapsed')
    expect(sidebar.dataset['collapsible']).toBe('icon')
    expect(slot('sidebar-container').classList).toContain('sidebar-extra')
  })

  it('defaultOpen=false starts collapsed', async () => {
    const { slot } = await render({ setup: (h) => h.defaultOpen.set(false) })
    expect(slot('sidebar').dataset['state']).toBe('collapsed')
  })

  it('Ctrl+B and Cmd+B toggle', async () => {
    const { slot, key } = await render()
    await key(document, { key: 'b', ctrlKey: true })
    expect(slot('sidebar').dataset['state']).toBe('collapsed')
    await key(document, { key: 'b', metaKey: true })
    expect(slot('sidebar').dataset['state']).toBe('expanded')
  })

  it('trigger: ghost icon button with aria-expanded and aria-controls', async () => {
    const { slot, trigger, stable } = await render()
    const button = trigger()
    for (const hook of ['cn-sidebar-trigger', 'cn-button-variant-ghost', 'cn-button-size-icon-sm'])
      expect(button.classList).toContain(hook)
    expect(button.getAttribute('aria-controls')).toBe(slot('sidebar').id)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    button.click()
    await stable()
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('hooks on the layout parts', async () => {
    const { slot } = await render()
    const hooks: Record<string, string> = {
      'sidebar-gap': 'cn-sidebar-gap',
      'sidebar-inner': 'cn-sidebar-inner',
      'sidebar-header': 'cn-sidebar-header',
      'sidebar-footer': 'cn-sidebar-footer',
      'sidebar-content': 'cn-sidebar-content',
      'sidebar-separator': 'cn-sidebar-separator',
      'sidebar-group': 'cn-sidebar-group',
      'sidebar-group-label': 'cn-sidebar-group-label',
      'sidebar-group-action': 'cn-sidebar-group-action',
      'sidebar-group-content': 'cn-sidebar-group-content',
      'sidebar-inset': 'cn-sidebar-inset',
      'sidebar-menu': 'cn-sidebar-menu',
      'sidebar-menu-action': 'cn-sidebar-menu-action',
      'sidebar-menu-badge': 'cn-sidebar-menu-badge',
      'sidebar-menu-skeleton': 'cn-sidebar-menu-skeleton',
      'sidebar-menu-sub': 'cn-sidebar-menu-sub',
      'sidebar-menu-sub-button': 'cn-sidebar-menu-sub-button',
    }
    for (const [name, hook] of Object.entries(hooks)) expect(slot(name).classList, name).toContain(hook)
    expect(slot('sidebar-rail').querySelector('.cn-sidebar-rail')).not.toBeNull()
  })

  it('menu button: variant / size hooks, active and size on the host (the peer)', async () => {
    const { el } = await render()
    const [home, inbox] = Array.from(el.querySelectorAll<HTMLElement>('iv-sidebar-menu-button'))
    expect(home.hasAttribute('data-active')).toBe(true)
    expect(home.dataset['size']).toBe('lg')
    expect(home.classList).toContain('peer/menu-button')
    const homeButton = home.querySelector('button')!
    expect(homeButton.classList).toContain('cn-sidebar-menu-button')
    expect(homeButton.classList).toContain('cn-sidebar-menu-button-size-lg')
    expect(homeButton.getAttribute('aria-current')).toBe('page')
    expect(inbox.querySelector('button')!.classList).toContain('cn-sidebar-menu-button-variant-outline')
    expect(sidebarMenuButtonVariants({ size: 'sm' })).toContain('cn-sidebar-menu-button-size-sm')
  })

  it('menu button tooltip shows only while collapsed', async () => {
    const { el, trigger, stable } = await render()
    const tooltipRoot = el.querySelector<HTMLElement>('iv-sidebar-menu-button iv-tooltip')!
    tooltipRoot.dispatchEvent(new MouseEvent('mouseenter'))
    await stable()
    expect(document.querySelector('[role="tooltip"]')).toBeNull()
    expect(tooltipRoot.querySelector('button')!.hasAttribute('aria-describedby')).toBe(false)
    tooltipRoot.dispatchEvent(new MouseEvent('mouseleave'))
    trigger().click()
    await stable()
    await new Promise((r) => setTimeout(r, 150))
    tooltipRoot.dispatchEvent(new MouseEvent('mouseenter'))
    await stable()
    expect(document.querySelector('[role="tooltip"]')!.textContent).toContain('Home')
  })

  it('sub button: size and active', async () => {
    const { slot } = await render()
    const sub = slot('sidebar-menu-sub-button')
    expect(sub.dataset['size']).toBe('sm')
    expect(sub.getAttribute('aria-current')).toBe('page')
  })

  it('skeleton widths are stable across renders', async () => {
    const widths = async () => {
      const { el, fixture } = await render()
      const w = Array.from(el.querySelectorAll<HTMLElement>('.cn-sidebar-menu-skeleton-text')).map((e) =>
        e.style.getPropertyValue('--skeleton-width'),
      )
      fixture.destroy()
      TestBed.resetTestingModule()
      return w
    }
    const first = await widths()
    expect(first.every((w) => /^\d+%$/.test(w))).toBe(true)
    expect(await widths()).toEqual(first)
  })

  it('collapsible="none": a plain panel, no gap, no container', async () => {
    const { slot } = await render({ setup: (h) => h.collapsible.set('none') })
    expect(slot('sidebar').classList).toContain('sidebar-extra')
    expect(slot('sidebar-gap')).toBeNull()
    expect(slot('sidebar-header')).not.toBeNull()
  })

  describe('mobile', () => {
    it('drawer: closed until the trigger opens it, then a modal dialog with focus inside', async () => {
      const { el, trigger, stable } = await render({ mobile: true })
      expect(el.querySelector('[role="dialog"]')).toBeNull()
      trigger().focus()
      trigger().click()
      await stable()
      const dialog = el.querySelector<HTMLElement>('[role="dialog"]')!
      expect(dialog.getAttribute('aria-modal')).toBe('true')
      expect(dialog.getAttribute('aria-label')).toBe('Sidebar')
      expect(dialog.contains(document.activeElement)).toBe(true)
      expect(trigger().getAttribute('aria-expanded')).toBe('true')
    })

    it('Escape closes and focus returns to the trigger', async () => {
      const { el, trigger, stable, key } = await render({ mobile: true })
      trigger().focus()
      trigger().click()
      await stable()
      expect(el.querySelector('[role="dialog"]')).not.toBeNull()
      await key(document.activeElement!, { key: 'Escape' })
      expect(el.querySelector('[role="dialog"]')).toBeNull()
      expect(document.activeElement).toBe(trigger())
    })

    it('backdrop click closes', async () => {
      const { el, slot, trigger, stable } = await render({ mobile: true })
      trigger().click()
      await stable()
      slot('sidebar-overlay').click()
      await stable()
      expect(el.querySelector('[role="dialog"]')).toBeNull()
    })

    it('the drawer itself takes focus, so Escape works even with nothing tabbable inside', async () => {
      const { el, trigger, stable, key } = await render({ mobile: true })
      trigger().click()
      await stable()
      const dialog = el.querySelector<HTMLElement>('[role="dialog"]')!
      expect(dialog.getAttribute('tabindex')).toBe('-1')
      dialog.focus()
      await key(dialog, { key: 'Escape' })
      expect(el.querySelector('[role="dialog"]')).toBeNull()
    })

    it('focuses the drawer itself when it has nothing tabbable inside (H4)', async () => {
      const { el, trigger, stable } = await render({ mobile: true, host: EmptyHost })
      trigger().click()
      await stable()
      const dialog = el.querySelector<HTMLElement>('[role="dialog"]')!
      expect(document.activeElement).toBe(dialog)
    })

    it('locks body scroll while open, restores it on close (H4)', async () => {
      const prevOverflow = document.body.style.overflow
      const { trigger, stable, key } = await render({ mobile: true })
      trigger().focus()
      trigger().click()
      await stable()
      expect(document.body.style.overflow).toBe('hidden')
      await key(document.activeElement!, { key: 'Escape' })
      expect(document.body.style.overflow).toBe(prevOverflow)
    })

    it('makes the rest of the page inert while open, restores it on close (H4)', async () => {
      const { el, trigger, stable, key } = await render({ mobile: true })
      const main = el.querySelector('main[ivSidebarInset]') as HTMLElement & { inert: boolean }
      const sidebarHost = el.querySelector('[data-slot="sidebar"]') as HTMLElement & { inert: boolean }
      expect(main.inert).toBeFalsy()
      trigger().focus()
      trigger().click()
      await stable()
      expect(main.inert).toBe(true)
      expect(sidebarHost.inert).toBeFalsy()
      await key(document.activeElement!, { key: 'Escape' })
      expect(main.inert).toBe(false)
    })

    it('resizing to desktop while open: no error, no dialog, content moves to the panel', async () => {
      const { el, slot, trigger, stable, viewport } = await render({ mobile: true })
      trigger().focus()
      trigger().click()
      await stable()
      expect(el.querySelector('[role="dialog"]')).not.toBeNull()
      viewport.next({ matches: false, breakpoints: {} })
      await stable()
      expect(el.querySelector('[role="dialog"]')).toBeNull()
      expect(slot('sidebar-container')).not.toBeNull()
      expect(slot('sidebar-header')).not.toBeNull()
      expect(document.activeElement).toBe(trigger())
    })

    it('axe passes with the drawer open', async () => {
      const { fixture, trigger, stable } = await render({ mobile: true })
      trigger().click()
      await stable()
      await expect(fixture.nativeElement).toHaveNoViolations()
    })
  })

  it('axe passes on desktop', async () => {
    const { fixture } = await render()
    await expect(fixture.nativeElement).toHaveNoViolations()
  })
})
