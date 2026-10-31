import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import {
  IvDropdownMenu,
  IvDropdownMenuContent,
  IvDropdownMenuLabel,
  IvDropdownMenuRadioGroup,
  IvDropdownMenuRadioItem,
  IvDropdownMenuSeparator,
  IvDropdownMenuTrigger,
} from '@inlaylab/ivorie/dropdown-menu';
import { IvSidebarService } from '@inlaylab/ivorie/sidebar';
import { Appearance, type ColorMode } from './appearance';
import { STYLES, type StyleName } from './appearance-options';

// No lucide here: every lucide icon is a component in one big module, so a lucide import in the
// first load (or in a @defer block) pulls the shared icon chunk into it. Icons are inline SVG.
@Component({
  selector: 'docs-site-header',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    IvButton,
    IvDropdownMenu,
    IvDropdownMenuContent,
    IvDropdownMenuLabel,
    IvDropdownMenuRadioGroup,
    IvDropdownMenuRadioItem,
    IvDropdownMenuSeparator,
    IvDropdownMenuTrigger,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-30 flex h-(--header-height) w-full shrink-0 items-center gap-1 border-b px-4 backdrop-blur lg:px-6',
  },
  template: `
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
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" />
      </svg>
    </button>
    <a routerLink="/" class="text-foreground mr-4 flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight" aria-label="Ivorie home">
      <img src="app_transparant.svg" alt="" width="28" height="28" class="size-7" />ivorie
    </a>
    <nav aria-label="Main" class="hidden items-center gap-1 md:flex">
      @for (link of links; track link.path) {
        <a
          [routerLink]="link.path"
          class="text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors"
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
    <ng-template #modeIcon>
      <!-- CSS, not @if: the server does not know the mode, so the markup must match. -->
      <svg class="dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg class="hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </ng-template>
    <!-- Deferred: the menu and its overlay are not needed for the first paint. -->
    @defer (on idle) {
      <iv-dropdown-menu>
        <button ivButton ivDropdownMenuTrigger variant="ghost" size="icon-sm" aria-label="Appearance">
          <ng-container [ngTemplateOutlet]="modeIcon" />
        </button>
        <iv-dropdown-menu-content align="end" class="w-40">
          <iv-dropdown-menu-label>Theme</iv-dropdown-menu-label>
          <iv-dropdown-menu-radio-group [value]="appearance.state().mode" (valueChange)="setMode($event)">
            <iv-dropdown-menu-radio-item value="light">Light</iv-dropdown-menu-radio-item>
            <iv-dropdown-menu-radio-item value="dark">Dark</iv-dropdown-menu-radio-item>
            <iv-dropdown-menu-radio-item value="system">System</iv-dropdown-menu-radio-item>
          </iv-dropdown-menu-radio-group>
          @if (styles.length > 1) {
            <iv-dropdown-menu-separator />
            <iv-dropdown-menu-label>Style</iv-dropdown-menu-label>
            <iv-dropdown-menu-radio-group [value]="appearance.state().style" (valueChange)="setStyle($event)">
              @for (s of styles; track s.name) {
                <iv-dropdown-menu-radio-item [value]="s.name">{{ s.label }}</iv-dropdown-menu-radio-item>
              }
            </iv-dropdown-menu-radio-group>
          }
        </iv-dropdown-menu-content>
      </iv-dropdown-menu>
    } @placeholder {
      <button ivButton type="button" variant="ghost" size="icon-sm" aria-label="Appearance" disabled>
        <ng-container [ngTemplateOutlet]="modeIcon" />
      </button>
    }
  `,
})
export class SiteHeader {
  protected readonly sidebar = inject(IvSidebarService);
  protected readonly appearance = inject(Appearance);
  protected readonly links = [
    { path: '/docs/installation', label: 'Docs' },
    { path: '/docs/components', label: 'Components' },
  ];
  protected readonly styles: readonly { name: StyleName; label: string }[] = STYLES;

  protected setMode(mode: string): void {
    this.appearance.setMode(mode as ColorMode);
  }

  protected setStyle(style: string): void {
    this.appearance.setStyle(style as StyleName);
  }
}
