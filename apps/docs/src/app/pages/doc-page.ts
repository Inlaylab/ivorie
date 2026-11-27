import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { PAGES } from '../../generated/pages';
import { Toc } from '../shell/toc';
import { CopyButton } from '../ui/copy-button';
import { DemoFrame } from '../ui/demo-frame';
import { InstallTabs } from '../ui/install-tabs';
import { TrustedHtmlPipe } from '../ui/trusted-html.pipe';
import NotFoundPage from './not-found';
import type { DocPageData } from './doc-page.resolver';

@Component({
  selector: 'docs-doc-page',
  imports: [RouterLink, Toc, CopyButton, DemoFrame, InstallTabs, TrustedHtmlPipe, NotFoundPage, LucideChevronLeft, LucideChevronRight],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page(); as resolved) {
    @let p = resolved.page;
    <div class="flex gap-12">
      <article class="min-w-0 max-w-3xl flex-1">
        <header class="mb-8">
          <h1 class="font-display text-foreground scroll-m-24 text-4xl font-medium tracking-[-0.03em] text-balance">{{ p.title }}</h1>
          <p class="text-muted-foreground mt-2 max-w-[65ch] text-base text-pretty">{{ p.description }}</p>
          @if (p.entry) {
            <div data-entry class="docs-pane mt-6 inline-flex max-w-full items-center gap-1 rounded-lg py-1 pr-1 pl-3">
              <code class="text-foreground truncate font-mono text-sm">import {{ '{' }} … {{ '}' }} from '{{ p.entry }}'</code>
              <docs-copy-button [text]="p.entry" label="Copy import path" />
            </div>
          }
        </header>

        <!-- Below xl the side table of contents is hidden: the same links fold up here. -->
        @if (p.toc.length) {
          <details data-toc class="mb-8 rounded-lg border px-4 xl:hidden">
            <summary class="text-foreground flex min-h-11 cursor-pointer items-center text-sm font-medium">On this page</summary>
            <div class="pb-3"><docs-toc [items]="p.toc" [titled]="false" /></div>
          </details>
        }

        <!-- Keyed by slug: a new page rebuilds every segment instead of reusing frames by index. -->
        @for (r of [resolved]; track r.page.slug) {
          @for (seg of r.page.segments; track $index) {
            @if (seg.kind === 'html') {
              <div class="docs-prose prose dark:prose-invert max-w-[70ch]" [innerHTML]="seg.html | trustedHtml"></div>
            } @else if (seg.kind === 'install') {
              <docs-install [slug]="seg.slug" [entry]="seg.entry" />
            } @else {
              <docs-demo-frame [demo]="r.demos[seg.name]" [source]="r.page.demos[seg.name]" />
            }
          }
        }

        <!-- Two cells split by a hairline: the grid's 1px gap shows the line color behind them. -->
        <nav aria-label="Pages" class="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-(--docs-line) text-sm">
          @if (prev(); as prev) {
            <a [routerLink]="['/docs', prev.slug]" class="hover:bg-muted focus-visible:ring-ring flex flex-col gap-1 bg-(--docs-ground) p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset">
              <span class="text-muted-foreground inline-flex items-center gap-1"><svg lucideChevronLeft class="size-4" aria-hidden="true"></svg>Previous</span>
              <span class="text-foreground font-medium">{{ prev.title }}</span>
            </a>
          } @else {
            <span class="bg-(--docs-ground)"></span>
          }
          @if (next(); as next) {
            <a [routerLink]="['/docs', next.slug]" class="hover:bg-muted focus-visible:ring-ring flex flex-col items-end gap-1 bg-(--docs-ground) p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset">
              <span class="text-muted-foreground inline-flex items-center gap-1">Next<svg lucideChevronRight class="size-4" aria-hidden="true"></svg></span>
              <span class="text-foreground font-medium">{{ next.title }}</span>
            </a>
          } @else {
            <span class="bg-(--docs-ground)"></span>
          }
        </nav>
      </article>

      <aside class="hidden w-56 shrink-0 xl:block">
        <div class="no-scrollbar sticky top-[calc(var(--header-height)+2rem)] max-h-[calc(100svh-var(--header-height)-4rem)] overflow-y-auto">
          <docs-toc [items]="p.toc" />
        </div>
      </aside>
    </div>
    } @else {
      <docs-not-found />
    }
  `,
})
export default class DocPageView {
  readonly page = input.required<DocPageData | null>();

  private readonly index = computed(() => PAGES.findIndex((e) => e.slug === this.page()?.page.slug));
  protected readonly prev = computed(() => PAGES[this.index() - 1] ?? null);
  protected readonly next = computed(() => PAGES[this.index() + 1] ?? null);
}
