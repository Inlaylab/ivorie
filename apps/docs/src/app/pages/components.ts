import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PAGES } from '../../generated/pages';

/** `/docs/components`: one card per component page, then one per chart example page. */
@Component({
  selector: 'docs-components',
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-8">
      <h1 class="font-display text-foreground text-3xl font-semibold tracking-tight text-balance">Components</h1>
      <p class="text-muted-foreground mt-2 max-w-[65ch] text-base text-pretty">
        {{ pages.length }} components, each with its own import path. Open one for examples and install steps.
      </p>
    </header>
    <section aria-labelledby="all-title" class="mb-12" data-testid="components-section">
      <h2 id="all-title" class="font-display text-foreground mb-4 text-xl font-semibold tracking-tight">All components</h2>
      <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        @for (p of pages; track p.slug) {
          <li><ng-container [ngTemplateOutlet]="card" [ngTemplateOutletContext]="{ $implicit: p }" /></li>
        }
      </ul>
    </section>
    <section aria-labelledby="charts-title" data-testid="charts-section">
      <div class="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="charts-title" class="font-display text-foreground text-xl font-semibold tracking-tight">Charts</h2>
        <a routerLink="/docs/chart" class="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">How charts work</a>
      </div>
      <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        @for (p of charts; track p.slug) {
          <li><ng-container [ngTemplateOutlet]="card" [ngTemplateOutletContext]="{ $implicit: p }" /></li>
        }
      </ul>
    </section>
    <ng-template #card let-p>
      <a
        [routerLink]="['/docs', p.slug]"
        class="hover:bg-muted/60 focus-visible:ring-ring flex h-full flex-col gap-1 rounded-2xl border p-5 outline-none transition-colors focus-visible:ring-2"
      >
        <span class="text-foreground font-medium">{{ p.title }}</span>
        <span class="text-muted-foreground text-sm text-pretty">{{ p.description }}</span>
      </a>
    </ng-template>
  `,
})
export default class ComponentsPage {
  protected readonly pages = PAGES.filter((p) => p.section === 'component');
  protected readonly charts = PAGES.filter((p) => p.section === 'charts');

  constructor() {
    inject(Meta).updateTag({ name: 'description', content: 'Every Ivorie component, with examples.' });
  }
}
