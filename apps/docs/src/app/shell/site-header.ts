import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvSidebarService } from '@inlaylab/ivorie/sidebar';
import { Appearance } from './appearance';

// No lucide here: every lucide icon is a component in one big module, so a lucide import in the
// first load (or in a @defer block) pulls the shared icon chunk into it. Icons are inline SVG.
@Component({
  selector: 'docs-site-header',
  imports: [RouterLink, RouterLinkActive, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A full-width bar: the page scrolls under it. Logo and sections on the left, actions on the right.
  host: { class: 'docs-header sticky top-0 z-30 flex h-(--header-height) w-full shrink-0 items-center border-b' },
  template: `
    <div class="relative mx-auto flex h-full w-full max-w-(--breakpoint-2xl) items-center gap-1 px-3 sm:px-5">
      <!-- docs() comes from the URL on both the server and the client, so @if hydrates cleanly. -->
      @if (docs()) {
        <button
          ivButton
          type="button"
          variant="ghost"
          size="icon-sm"
          class="md:hidden"
          aria-label="Toggle navigation"
          [attr.aria-expanded]="sidebar.expanded()"
          [attr.aria-controls]="sidebar.id"
          (click)="sidebar.toggle()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 7h16M4 12h10M4 17h16" />
          </svg>
        </button>
      }
      <!-- The wordmark: the name and the brand dot, no app icon. -->
      <a routerLink="/" class="text-foreground mr-1 flex shrink-0 items-baseline gap-0.5 rounded-md px-1.5 py-1 sm:mr-6">
        <span class="font-display text-[1.125rem] font-bold tracking-[-0.02em]">Ivorie</span>
        <span class="size-1.5 rounded-full bg-(--brand)" aria-hidden="true"></span>
      </a>
      <!-- On phones the links scroll; the fade at the edge says there is more. Centered on wide screens. -->
      <nav
        aria-label="Main"
        class="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto mask-r-from-80% sm:mask-none lg:absolute lg:left-1/2 lg:-translate-x-1/2"
      >
        <!-- Docs stays active on every docs page except the components index. -->
        <a
          routerLink="/docs/installation"
          [class]="link + (docs() && !components.isActive ? ' ' + active : '')"
          [attr.aria-current]="docs() && !components.isActive ? 'page' : null"
          >Docs</a
        >
        <a routerLink="/docs/components" [routerLinkActive]="active" #components="routerLinkActive" ariaCurrentWhenActive="page" [class]="link">Components</a>
        <a routerLink="/blocks" [routerLinkActive]="active" ariaCurrentWhenActive="page" [class]="link">Blocks</a>
        <a routerLink="/playground" [routerLinkActive]="active" ariaCurrentWhenActive="page" [class]="link">Playground</a>
        <a routerLink="/roadmap" [routerLinkActive]="active" ariaCurrentWhenActive="page" [class]="link + ' hidden lg:inline-block'">Roadmap</a>
      </nav>
      <span class="flex-1"></span>
      <a ivButton variant="ghost" size="sm" class="px-2" href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" aria-label="Ivorie on GitHub">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
        <span class="hidden sm:inline">GitHub</span>
      </a>
      <!-- One button: light or dark. Icons swap with CSS, so the server markup matches. -->
      <button ivButton type="button" variant="ghost" size="icon-sm" aria-label="Toggle dark mode" (click)="appearance.toggle()">
        <svg class="dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
        <svg class="hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      </button>
      <a ivButton size="sm" class="ml-1.5 hidden sm:inline-flex" routerLink="/docs/installation">Get started</a>
    </div>
  `,
})
export class SiteHeader {
  /** On /docs pages: the sidebar exists, so the mobile toggle shows. */
  readonly docs = input(false);
  protected readonly sidebar = inject(IvSidebarService);
  protected readonly appearance = inject(Appearance);
  protected readonly link =
    'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] shrink-0 rounded-md px-2 py-1.5 text-sm sm:px-2.5 font-medium transition-colors duration-(--docs-dur)';
  /** The page you are on: a filled pill, so it reads at a glance. */
  protected readonly active = '!text-foreground bg-foreground/[0.08]';
}
