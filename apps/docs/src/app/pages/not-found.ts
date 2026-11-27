import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { DocsLineLost } from '../ui/line-art/lost';

/** Unknown pages: say so plainly, show a path with a missing segment, and offer the two most likely ways back. */
@Component({
  selector: 'docs-not-found',
  imports: [RouterLink, IvButton, DocsLineLost],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div class="max-w-xl">
        <h1 class="font-display text-foreground text-4xl font-medium tracking-[-0.03em] text-balance">This page does not exist</h1>
        <p class="text-muted-foreground mt-4 text-lg text-pretty">The link may be old, or the name may be misspelled. Component pages live at /docs/&lt;name&gt;.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a ivButton routerLink="/docs/installation">Go to installation</a>
          <a ivButton variant="outline" routerLink="/docs/components">Browse components</a>
        </div>
      </div>
      <docs-line-lost class="w-full max-w-sm" />
    </div>
  `,
})
export default class NotFoundPage {}
