import { PLATFORM_ID, REQUEST } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { provideIvorie } from '@ivorie/ui/core'
import { IvSidebarService } from './sidebar.service'

function clearCookie() {
  document.cookie = 'sidebar_state=; path=/; max-age=0'
}

function service(providers: unknown[] = []) {
  TestBed.configureTestingModule({ providers: [IvSidebarService, ...(providers as never[])] })
  return TestBed.inject(IvSidebarService)
}

const serverRequest = (cookie: string) =>
  ({ headers: new Headers({ cookie }) }) as unknown as Request

describe('IvSidebarService', () => {
  afterEach(() => {
    clearCookie()
    vi.restoreAllMocks()
  })

  it('no cookie: defaultOpen decides', () => {
    const s = service()
    expect(s.open()).toBe(true)
    s.init(false, 'sidebar_state')
    expect(s.open()).toBe(false)
    expect(s.state()).toBe('collapsed')
  })

  it('a saved cookie wins over defaultOpen', () => {
    document.cookie = 'sidebar_state=false; path=/'
    const s = service()
    s.init(true, 'sidebar_state')
    expect(s.open()).toBe(false)
  })

  it('server: reads the request cookie, never document.cookie', () => {
    const cookieGetter = vi.spyOn(Document.prototype, 'cookie', 'get')
    const s = service([
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: REQUEST, useValue: serverRequest('theme=dark; sidebar_state=false') },
    ])
    s.init(true, 'sidebar_state')
    expect(s.state()).toBe('collapsed')
    expect(cookieGetter).not.toHaveBeenCalled()
  })

  it('server: toggling writes no cookie', () => {
    const cookieSetter = vi.spyOn(Document.prototype, 'cookie', 'set')
    const s = service([{ provide: PLATFORM_ID, useValue: 'server' }])
    s.toggle()
    expect(s.open()).toBe(false)
    expect(cookieSetter).not.toHaveBeenCalled()
  })

  it('desktop toggle flips open and saves the cookie', () => {
    const s = service()
    s.toggle()
    expect(s.open()).toBe(false)
    expect(document.cookie).toContain('sidebar_state=false')
    expect(s.expanded()).toBe(false)
  })

  it('mobile toggle flips openMobile and saves nothing', () => {
    const s = service([provideIvorie({ sidebarMobile: true })])
    expect(s.isMobile()).toBe(true)
    s.toggle()
    expect(s.openMobile()).toBe(true)
    expect(s.open()).toBe(true)
    expect(s.expanded()).toBe(true)
    expect(document.cookie).not.toContain('sidebar_state')
  })

  it('ignores a cookie whose name only ends with sidebar_state', () => {
    document.cookie = 'my_sidebar_state=false; path=/'
    const s = service()
    expect(s.open()).toBe(true)
    document.cookie = 'my_sidebar_state=; path=/; max-age=0'
  })
})
