import { BreakpointObserver } from '@angular/cdk/layout'
import { DOCUMENT, isPlatformBrowser } from '@angular/common'
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  REQUEST,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core'
import { IV_CONFIG, IvIdGenerator } from '@ivorie/ui/core'

export const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const MOBILE_QUERY = '(max-width: 767px)'

export type SidebarState = 'expanded' | 'collapsed'
export type SidebarVariant = 'sidebar' | 'floating' | 'inset'
export type SidebarCollapsible = 'offcanvas' | 'icon' | 'none'

/** Reads the saved desktop state from a `Cookie` header or the browser cookie string. */
function readSavedState(cookies: string, name: string): boolean | null {
  const match = new RegExp(`(?:^|;\\s*)${name}=(true|false)(?:;|$)`).exec(cookies)
  return match ? match[1] === 'true' : null
}

/**
 * Open state of one sidebar. Provided by `iv-sidebar-provider`.
 *
 * SSR: the saved state comes from the request's `Cookie` header on the server and from
 * the DOCUMENT cookie in the browser, so both render the same HTML. `isMobile` starts from
 * `provideIvorie({ sidebarMobile })` and follows the viewport once the app has rendered.
 */
@Injectable()
export class IvSidebarService {
  private readonly document = inject(DOCUMENT)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private readonly request = inject(REQUEST, { optional: true })

  /** Cookie that saves the desktop state. Empty: not saved. Each sidebar on a page needs its own. */
  private cookieName = SIDEBAR_COOKIE_NAME

  readonly id = inject(IvIdGenerator).next('iv-sidebar')
  readonly open = signal(true)
  readonly openMobile = signal(false)
  readonly isMobile = signal(inject(IV_CONFIG).sidebarMobile ?? false)
  readonly state = computed<SidebarState>(() => (this.open() ? 'expanded' : 'collapsed'))
  /** Open state of whichever form is showing: the drawer on mobile, the panel on desktop. */
  readonly expanded = computed(() => (this.isMobile() ? this.openMobile() : this.open()))

  constructor() {
    const breakpoints = inject(BreakpointObserver)
    const destroyRef = inject(DestroyRef)
    // Browser only, after the first render: the server and the hydrating client agree on isMobile.
    afterNextRender(() => {
      const sub = breakpoints.observe(MOBILE_QUERY).subscribe(({ matches }) => {
        this.isMobile.set(matches)
        if (!matches) this.openMobile.set(false)
      })
      destroyRef.onDestroy(() => sub.unsubscribe())
    })
  }

  /** Called once by the provider: the start state is the saved cookie, else `defaultOpen`. */
  init(defaultOpen: boolean, cookieName: string) {
    this.cookieName = cookieName
    const cookies = (this.isBrowser ? this.document.cookie : this.request?.headers.get('cookie')) ?? ''
    this.open.set((cookieName ? readSavedState(cookies, cookieName) : null) ?? defaultOpen)
  }

  toggle() {
    this.setOpen(!this.expanded())
  }

  setOpen(value: boolean) {
    if (this.isMobile()) {
      this.openMobile.set(value)
      return
    }
    this.open.set(value)
    if (this.isBrowser && this.cookieName) {
      this.document.cookie = `${this.cookieName}=${value}; path=/; max-age=${COOKIE_MAX_AGE}`
    }
  }
}
