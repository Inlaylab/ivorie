import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IvButton } from '@ivorie/ui/button';

@Component({
  selector: 'docs-not-found',
  imports: [RouterLink, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-xl py-16">
      <p class="text-muted-foreground font-mono text-sm">404</p>
      <h1 class="text-foreground mt-3 text-4xl font-semibold tracking-[-0.03em]">This page does not exist</h1>
      <p class="text-muted-foreground mt-4 text-lg">The link may be old, or the name may be misspelled. Component pages live at /docs/&lt;name&gt;.</p>
      <a ivButton class="mt-8" routerLink="/docs/installation">Go to installation</a>
    </div>
  `,
})
export default class NotFoundPage {}
