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
          <h1 class="text-foreground scroll-m-24 text-3xl font-semibold tracking-tight text-balance">{{ p.title }}</h1>
          <p class="text-muted-foreground mt-2 max-w-[65ch] text-base text-pretty">{{ p.description }}</p>
          @if (p.entry) {
            <div data-entry class="bg-muted/60 mt-6 inline-flex max-w-full items-center gap-1 rounded-lg border py-1 pr-1 pl-3">
              <code class="text-foreground truncate font-mono text-sm">import {{ '{' }} … {{ '}' }} from '{{ p.entry }}'</code>
              <docs-copy-button [text]="p.entry" label="Copy import path" />
            </div>
          }
        </header>

        @for (seg of p.segments; track $index) {
          @if (seg.kind === 'html') {
            <div class="docs-prose prose dark:prose-invert max-w-none" [innerHTML]="seg.html | trustedHtml"></div>
          } @else if (seg.kind === 'install') {
            <docs-install [slug]="seg.slug" [entry]="seg.entry" />
          } @else {
            <docs-demo-frame [demo]="resolved.demos[seg.name]" [source]="p.demos[seg.name]" />
          }
        }

        <nav aria-label="Pages" class="mt-16 flex items-stretch justify-between gap-4 border-t pt-6 text-sm">
          @if (prev(); as prev) {
            <a [routerLink]="['/docs', prev.slug]" class="group hover:bg-muted flex flex-col gap-1 rounded-lg p-3 -ml-3">
              <span class="text-muted-foreground inline-flex items-center gap-1"><svg lucideChevronLeft class="size-4" aria-hidden="true"></svg>Previous</span>
              <span class="text-foreground font-medium">{{ prev.title }}</span>
            </a>
          } @else {
            <span></span>
          }
          @if (next(); as next) {
            <a [routerLink]="['/docs', next.slug]" class="group hover:bg-muted -mr-3 flex flex-col items-end gap-1 rounded-lg p-3">
              <span class="text-muted-foreground inline-flex items-center gap-1">Next<svg lucideChevronRight class="size-4" aria-hidden="true"></svg></span>
              <span class="text-foreground font-medium">{{ next.title }}</span>
            </a>
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
