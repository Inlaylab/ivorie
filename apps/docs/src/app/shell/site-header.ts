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
  host: {
    class:
      'bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-30 flex h-(--header-height) w-full shrink-0 items-center gap-1 border-b px-4 backdrop-blur-md lg:px-6',
  },
  template: `
    <!-- Class, not @if: the server and the client must render the same markup. -->
    <button
      ivButton
      type="button"
      variant="ghost"
      size="icon-sm"
      class="md:hidden"
      [class.hidden]="!docs()"
      aria-label="Toggle navigation"
      [attr.aria-expanded]="sidebar.expanded()"
      [attr.aria-controls]="sidebar.id"
      (click)="sidebar.toggle()"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" />
      </svg>
    </button>
    <a routerLink="/" class="text-foreground mr-3 flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight sm:mr-5" aria-label="Ivorie home">
      <svg class="size-5" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="1" y="1" width="18" height="18" rx="6" fill="currentColor" />
        <rect x="6" y="5" width="3" height="10" rx="1.5" class="fill-background" />
        <circle cx="13" cy="13.5" r="1.75" class="fill-background" />
      </svg>
      <span class="hidden sm:inline">ivorie</span>
    </a>
    <nav aria-label="Main" class="flex items-center gap-0.5">
      @for (link of links; track link.path) {
        <a
          [routerLink]="link.path"
          routerLinkActive="text-foreground bg-muted"
          ariaCurrentWhenActive="page"
          [class.hidden]="link.wideOnly"
          class="text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 text-sm font-medium transition-colors md:inline-block"
          >{{ link.label }}</a
        >
      }
    </nav>
    <span class="flex-1"></span>
    <a ivButton variant="ghost" size="icon-sm" href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" aria-label="GitHub repository">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
      </svg>
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
  `,
})
export class SiteHeader {
  /** On /docs pages: the sidebar exists, so the mobile toggle shows. */
  readonly docs = input(false);
  protected readonly sidebar = inject(IvSidebarService);
  protected readonly appearance = inject(Appearance);
  protected readonly links = [
    { path: '/docs/installation', label: 'Docs', wideOnly: false },
    { path: '/docs/components', label: 'Components', wideOnly: true },
    { path: '/playground', label: 'Playground', wideOnly: false },
  ];
}
