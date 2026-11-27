import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PAGES } from '../../generated/pages';
import { GROUPS } from '../shell/site-nav';

const COMPONENTS = PAGES.filter((p) => p.section === 'component');

/** `/docs/components`: the components by family, as the side nav groups them, then the chart example pages. */
@Component({
  selector: 'docs-components',
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-12">
      <h1 class="font-display text-foreground text-4xl font-medium tracking-[-0.03em] text-balance">Components</h1>
      <p class="text-muted-foreground mt-2 max-w-[65ch] text-base text-pretty">
        {{ count }} components, each with its own import path. Open one for examples and install steps.
      </p>
    </header>
    <section aria-labelledby="all-title" class="mb-14" data-testid="components-section">
      <h2 id="all-title" class="sr-only">All components</h2>
      <div class="flex flex-col gap-12">
        @for (f of families; track f.label) {
          <div data-testid="family" class="flex flex-col gap-4">
            <div class="flex items-baseline gap-3">
              <h3 class="font-display text-foreground text-xl font-medium tracking-[-0.02em]">{{ f.label }}</h3>
              <span data-testid="family-count" class="text-muted-foreground font-mono text-xs tabular-nums">{{ f.pages.length }}</span>
            </div>
            <ng-container [ngTemplateOutlet]="grid" [ngTemplateOutletContext]="{ $implicit: f.pages }" />
          </div>
        }
      </div>
    </section>
    <section aria-labelledby="charts-title" data-testid="charts-section" class="flex flex-col gap-4">
      <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <div class="flex items-baseline gap-3">
          <h2 id="charts-title" class="font-display text-foreground text-xl font-medium tracking-[-0.02em]">Charts</h2>
          <span class="text-muted-foreground font-mono text-xs tabular-nums">{{ charts.length }}</span>
        </div>
        <a routerLink="/docs/chart" class="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">How charts work</a>
      </div>
      <ng-container [ngTemplateOutlet]="grid" [ngTemplateOutletContext]="{ $implicit: charts }" />
    </section>
    <!-- A hairline grid: cells on the page ground, the 1px gap shows the line color behind them. -->
    <ng-template #grid let-pages>
      <ul class="grid gap-px overflow-hidden border bg-(--docs-line) sm:grid-cols-2 xl:grid-cols-3">
        @for (p of pages; track p.slug) {
          <li class="flex bg-(--docs-ground)">
            <a
              [routerLink]="['/docs', p.slug]"
              class="hover:bg-muted focus-visible:ring-ring flex w-full flex-col gap-1 p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset"
            >
              <span class="text-foreground font-medium">{{ p.title }}</span>
              <span class="text-muted-foreground text-sm text-pretty">{{ p.description }}</span>
            </a>
          </li>
        }
      </ul>
    </ng-template>
  `,
})
export default class ComponentsPage {
  protected readonly count = COMPONENTS.length;
  /** The side nav's component groups, each page with its full entry (the nav keeps only slug and title). */
  protected readonly families = GROUPS.map((g) => ({
    label: g.label,
    pages: g.pages.map((p) => COMPONENTS.find((c) => c.slug === p.slug)).filter((p) => !!p),
  })).filter((f) => f.pages.length);
  protected readonly charts = PAGES.filter((p) => p.section === 'charts');

  constructor() {
    inject(Meta).updateTag({ name: 'description', content: 'Every Ivorie component, with examples.' });
  }
}
