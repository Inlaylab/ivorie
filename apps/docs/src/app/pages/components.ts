import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PAGES } from '../../generated/pages';

/** `/docs/components`: one card per component page. */
@Component({
  selector: 'docs-components',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <h1 class="text-foreground text-3xl font-semibold tracking-tight text-balance">Components</h1>
      <p class="text-muted-foreground mt-2 max-w-[65ch] text-base text-pretty">
        {{ pages.length }} components, each with its own import path. Open one for examples and install steps.
      </p>
    </header>
    <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      @for (p of pages; track p.slug) {
        <li>
          <a
            [routerLink]="['/docs', p.slug]"
            class="hover:bg-muted/60 focus-visible:ring-ring flex h-full flex-col gap-1 rounded-lg border p-4 outline-none transition-colors focus-visible:ring-2"
          >
            <span class="text-foreground font-medium">{{ p.title }}</span>
            <span class="text-muted-foreground text-sm text-pretty">{{ p.description }}</span>
          </a>
        </li>
      }
    </ul>
  `,
})
export default class ComponentsPage {
  protected readonly pages = PAGES.filter((p) => p.section === 'component');

  constructor() {
    inject(Meta).updateTag({ name: 'description', content: 'Every Ivorie component, with examples.' });
  }
}
