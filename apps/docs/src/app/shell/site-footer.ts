import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** The footer on every page: credits, the license and the site links. */
@Component({
  selector: 'docs-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block border-t' },
  template: `
    <div class="text-muted-foreground mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm sm:px-6">
      <span class="flex items-center gap-2">
        <span class="size-1.5 rounded-full bg-(--brand)" aria-hidden="true"></span>
        <!-- Credit the work this stands on, the way shadcn/ui ports do. -->
        <span
          >By
          <a href="https://github.com/Inlaylab" target="_blank" rel="noreferrer" class="text-foreground font-medium underline underline-offset-4 hover:no-underline">Inlaylab</a>.
          Built on
          <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer" class="text-foreground underline underline-offset-4 hover:no-underline">shadcn/ui</a>
          and
          <a href="https://www.radix-ui.com/primitives" target="_blank" rel="noreferrer" class="text-foreground underline underline-offset-4 hover:no-underline">Radix UI</a>
          patterns. MIT license.</span
        >
      </span>
      <nav aria-label="Footer" class="flex flex-wrap gap-x-5 gap-y-1">
        <a routerLink="/docs/components" class="hover:text-foreground inline-flex min-h-11 items-center">Components</a>
        <a routerLink="/blocks" class="hover:text-foreground inline-flex min-h-11 items-center">Blocks</a>
        <a routerLink="/changelog" class="hover:text-foreground inline-flex min-h-11 items-center">Changelog</a>
        <a href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" class="hover:text-foreground inline-flex min-h-11 items-center">Source on GitHub</a>
      </nav>
    </div>
  `,
})
export class SiteFooter {}
