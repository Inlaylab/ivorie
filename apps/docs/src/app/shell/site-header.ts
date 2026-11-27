import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { Appearance } from './appearance';
import { SiteNav } from './site-nav';

/** The maintainer's Buy Me a Coffee page, as .github/funding.yml names it. */
export const COFFEE_URL = 'https://buymeacoffee.com/bhavikbhensajaliya';

// No lucide here: every lucide icon is a component in one big module, so a lucide import in the
// first load (or in a @defer block) pulls the shared icon chunk into it. Icons are inline SVG.
@Component({
  selector: 'docs-site-header',
  imports: [RouterLink, RouterLinkActive, IvButton, SiteNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A full-width bar: the page scrolls under it. Logo and sections on the left, actions on the right.
  host: { class: 'docs-header sticky top-0 z-30 flex h-(--header-height) w-full shrink-0 items-center border-b' },
  template: `
    <!-- Aligned to the page's rails (.docs-rail): same width, same hairlines down each side. -->
    <div class="docs-rail relative flex h-full w-full items-center gap-1 px-3 sm:px-5">
      <!-- The wordmark: the name and the brand dot, no app icon. -->
      <a routerLink="/" class="text-foreground mr-1 flex shrink-0 items-baseline gap-0.5 rounded-md px-1.5 py-1 sm:mr-6">
        <span class="font-display text-[1.125rem] font-semibold tracking-[-0.02em]">Ivorie</span>
        <span class="size-1.5 rounded-full bg-(--brand)" aria-hidden="true"></span>
      </a>
      <!-- On phones the links scroll; the fade at the edge says there is more. Centered on wide screens. -->
      <nav
        aria-label="Main"
        class="hidden min-w-0 items-center gap-0.5 md:flex lg:absolute lg:left-1/2 lg:-translate-x-1/2"
      >
        <!-- Docs stays active on every docs page except the components index. -->
        <a
          routerLink="/docs/installation"
          [class]="link + (docs() && !components.isActive ? ' ' + active : '')"
          [attr.aria-current]="docs() && !components.isActive ? 'page' : null"
          >Docs
          @if (docs() && !components.isActive) {
            <span data-testid="nav-mark" aria-hidden="true" [class]="mark"></span>
          }
        </a>
        <a routerLink="/docs/components" [routerLinkActive]="active" #components="routerLinkActive" ariaCurrentWhenActive="page" [class]="link"
          >Components
          @if (components.isActive) {
            <span data-testid="nav-mark" aria-hidden="true" [class]="mark"></span>
          }
        </a>
        <a routerLink="/blocks" [routerLinkActive]="active" #blocks="routerLinkActive" ariaCurrentWhenActive="page" [class]="link"
          >Blocks
          @if (blocks.isActive) {
            <span data-testid="nav-mark" aria-hidden="true" [class]="mark"></span>
          }
        </a>
        <a routerLink="/playground" [routerLinkActive]="active" #playground="routerLinkActive" ariaCurrentWhenActive="page" [class]="link"
          >Playground
          @if (playground.isActive) {
            <span data-testid="nav-mark" aria-hidden="true" [class]="mark"></span>
          }
        </a>
        <a routerLink="/changelog" [routerLinkActive]="active" #changelog="routerLinkActive" ariaCurrentWhenActive="page" [class]="link"
          >Changelog
          @if (changelog.isActive) {
            <span data-testid="nav-mark" aria-hidden="true" [class]="mark"></span>
          }
        </a>
      </nav>
      <span class="flex-1"></span>
      <a ivButton variant="ghost" size="sm" class="hidden px-2 md:inline-flex" href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" aria-label="Ivorie on GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
        <span class="hidden sm:inline">GitHub</span>
      </a>
      <!-- Support the project: an icon beside GitHub, the words in its label and tooltip. -->
      <a ivButton variant="ghost" size="icon-sm" class="hidden md:inline-flex" [href]="coffee" target="_blank" rel="noreferrer" aria-label="Buy me a coffee" title="Buy me a coffee">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 2v2M14 2v2M6 2v2" /><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
        </svg>
      </a>
      <!-- One button: light or dark. Icons swap with CSS, so the server markup matches. -->
      <button ivButton type="button" variant="ghost" size="icon-sm" class="max-md:size-11" aria-label="Toggle dark mode" (click)="appearance.toggle()">
        <svg class="dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
        <svg class="hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
      <a ivButton size="sm" class="ml-1.5 hidden sm:inline-flex" routerLink="/docs/installation">Get started</a>
      <!-- Phones and tablets: one menu with every link, and the docs nav on docs pages. -->
      <button
        ivButton
        type="button"
        variant="ghost"
        size="icon"
        #menuButton
        class="ml-1 size-11 md:hidden"
        aria-label="Menu"
        aria-controls="site-menu"
        [attr.aria-expanded]="menuOpen()"
        (click)="openMenu()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
    </div>
    <!-- A native dialog: focus trap, Escape and backdrop for free, and no overlay code in the first load. -->
    <dialog #menu id="site-menu" class="docs-menu" aria-label="Menu" (close)="menuOpen.set(false)" (click)="closeOnLink($event)">
      <div class="flex h-(--header-height) items-center justify-between border-b px-4">
        <span class="font-display text-foreground text-lg font-medium">Ivorie</span>
        <button ivButton type="button" variant="ghost" size="icon" aria-label="Close menu" (click)="menu.close()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <nav aria-label="Site" class="flex flex-col px-4">
        @for (l of links; track l.href) {
          <a [routerLink]="l.href" class="text-foreground flex min-h-11 items-center border-b text-base font-medium">{{ l.label }}</a>
        }
        <a href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" class="text-foreground flex min-h-11 items-center border-b text-base font-medium">GitHub</a>
        <a [href]="coffee" target="_blank" rel="noreferrer" class="text-foreground flex min-h-11 items-center border-b text-base font-medium">Buy me a coffee</a>
      </nav>
      @if (docs()) {
        <!-- Lazy: the docs nav and its page list stay out of the first load. The menu starts closed; opening it
             early loads the nav at once. -->
        @defer (on idle; on interaction(menuButton)) {
          <div class="py-4">
            <docs-site-nav />
          </div>
        }
      }
    </dialog>
  `,
})
export class SiteHeader {
  /** On /docs pages: the sidebar exists, so the mobile toggle shows. */
  readonly docs = input(false);
  protected readonly appearance = inject(Appearance);
  protected readonly coffee = COFFEE_URL;
  protected readonly links = [
    { href: '/docs/installation', label: 'Docs' },
    { href: '/docs/components', label: 'Components' },
    { href: '/blocks', label: 'Blocks' },
    { href: '/playground', label: 'Playground' },
    { href: '/changelog', label: 'Changelog' },
  ];
  protected readonly menuOpen = signal(false);
  private readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');

  /** Any link in the menu closes it, also one to the page you are on (no navigation event then). */
  protected closeOnLink(event: MouseEvent): void {
    if (!(event.target as Element).closest('a')) return;
    const dialog = this.menu().nativeElement;
    // A test DOM without close() still closes the dialog (as openMenu without showModal).
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    this.menuOpen.set(false);
  }

  constructor() {
    // A link in the menu navigates; the menu then closes itself.
    const sub = inject(Router).events.subscribe((e) => {
      if (e instanceof NavigationEnd && this.menu().nativeElement.open) this.menu().nativeElement.close();
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }

  protected openMenu(): void {
    const dialog = this.menu().nativeElement;
    // showModal traps focus and closes on Escape; a test DOM without it still opens the dialog.
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    this.menuOpen.set(true);
  }
  protected readonly link =
    'text-muted-foreground hover:text-foreground relative shrink-0 rounded-md px-2 py-1.5 text-sm sm:px-2.5 font-medium transition-colors duration-(--docs-dur)';
  /** The page you are on: ink instead of muted, with the accent dot (the mark template) under it. */
  protected readonly active = '!text-foreground';
  /** The accent dot under the active link. */
  protected readonly mark = 'absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-(--brand)';
}
