import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, afterRenderEffect, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvInput } from '@inlaylab/ivorie/input';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IvMeter } from '@inlaylab/ivorie/meter';
import { IvSparkline } from '@inlaylab/ivorie/sparkline';
import { IV_CHART_IMPORTS, type IvChartConfig } from '@inlaylab/ivorie/chart';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';
import { CHANGELOG, type ChangelogKind } from '../../generated/changelog';
import { PAGES } from '../../generated/pages';
import { IVORIE } from '../../generated/cli';
import { CopyButton } from '../ui/copy-button';
import { THEMES, THEME_INFO, type ThemeName } from '../../generated/looks';
import { PlaygroundLook, previewVars } from '../playground/playground-look';
import { Appearance } from '../shell/appearance';
import { DEFAULT_THEME } from '../shell/appearance-options';
import { TrustedHtmlPipe } from '../ui/trusted-html.pipe';

/** 1.6.0's picture: the same button in four themes. */
const THEMED: ThemeName[] = ['slate', 'clay', 'bento', 'mono'];

type Kind = 'all' | ChangelogKind;

/** Changed comes first on the page: it is what to read before an upgrade. */
const ORDER: ChangelogKind[] = ['changed', 'new', 'improvements', 'fixes'];
const LABELS: Record<ChangelogKind, string> = { changed: 'Changed', new: 'New', improvements: 'Improvements', fixes: 'Fixes' };

/** A note's text, for search: tags out, the entities the renderer writes decoded. */
const plain = (html: string) =>
  html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/** Wraps each match in <mark>, in text only: tags and their attributes are never touched. */
function markHtml(html: string, q: string): string {
  if (!q) return html;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return html
    .split(/(<[^>]+>)/)
    .map((part) => (part.startsWith('<') ? part : part.replace(re, '<mark>$&</mark>')))
    .join('');
}

/** What comes after the latest release. Keep in step with ROADMAP.md. */
const NEXT = [
  { version: '1.7.0', title: 'Ready for AI tools: AGENTS.md, llms.txt and an MCP server', status: 'Planned' },
  { version: '2.0.0', title: 'New themes; legacy themes and 1.x names removed', status: 'Planned' },
];

/** The changelog: every release from CHANGELOG.md, newest first. Version and date on the left, notes on the right. */
@Component({
  selector: 'docs-changelog',
  imports: [RouterLink, DatePipe, TrustedHtmlPipe, IvButton, IvInput, IV_SELECT_IMPORTS, CopyButton, IvMeter, IvSparkline, IV_CHART_IMPORTS, IV_TABLE_IMPORTS],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="docs-rail px-4 py-16 sm:px-8 lg:py-24">
      <header class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <!-- Two tones: the page's job in muted ink, the product in full ink. -->
          <h1 class="font-display text-muted-foreground text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] font-medium tracking-[-0.035em]">
            Product updates. <br class="max-sm:hidden" />What's new in <span class="text-foreground">Ivorie.</span>
          </h1>
          <p class="text-muted-foreground mt-5 text-lg text-pretty">
            What changed in each release of <code class="text-foreground font-mono text-base">&#64;inlaylab/ivorie</code> and the
            <code class="text-foreground font-mono text-base">ivorie</code> CLI. Both share one version.
          </p>
        </div>
        <!-- A plain link, not the router: the feed is a file next to the pages. -->
        <a ivButton variant="outline" size="sm" href="changelog.xml" class="self-start lg:self-auto">RSS feed</a>
      </header>

      <!-- The overview: three numbers from the data, in hairline cells. -->
      <dl class="mt-12 grid gap-px border bg-(--docs-line) sm:grid-cols-3">
        @for (st of stats; track st.label) {
          <div data-testid="overview-stat" class="flex flex-col gap-1 bg-(--docs-ground) px-6 py-5">
            <dt class="text-muted-foreground font-mono text-xs">{{ st.label }}</dt>
            <dd class="font-display text-foreground order-first text-3xl font-medium tracking-[-0.03em] tabular-nums">{{ st.value }}</dd>
          </div>
        }
      </dl>

      <div class="mt-14 lg:grid lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-16">
        <!-- Every version, always in view on wide screens. Narrow screens scroll the list itself. -->
        <nav aria-label="Releases" class="hidden lg:block">
          <ul class="sticky top-[calc(var(--header-height)+2rem)] flex flex-col border-l">
            @for (r of releases; track r.version; let first = $first) {
              <li>
                <a
                  [routerLink]="[]"
                  [fragment]="anchor(r.version)"
                  [attr.aria-current]="active() === r.version ? 'true' : null"
                  class="text-muted-foreground hover:text-foreground aria-[current=true]:text-foreground aria-[current=true]:border-(--brand) -ml-px flex items-center gap-2 border-l-2 border-transparent py-1 pl-4 font-mono text-sm tabular-nums transition-colors duration-(--docs-dur)"
                  >{{ r.version }}
                  @if (first) {
                    <span class="bg-primary text-primary-foreground rounded px-1.5 font-sans text-[0.6875rem] font-medium">Latest</span>
                  }
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="min-w-0">
          <!-- Kinds, a search and your version: three ways to read only what you need. -->
          <div class="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <div role="radiogroup" aria-label="Show" class="docs-pane no-scrollbar flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-full p-1">
              @for (k of kinds; track k.value) {
                <label [class]="pill">
                  <input type="radio" class="sr-only" name="changelog-kind" [value]="k.value" [checked]="kind() === k.value" (change)="kind.set(k.value)" />
                  {{ k.label }}
                </label>
              }
            </div>
            <input ivInput type="search" class="md:w-56" placeholder="Search notes" aria-label="Search notes" [value]="query()" (input)="query.set($any($event.target).value)" />
            <iv-select data-testid="since" [(value)]="since" placeholder="I'm on…">
              <iv-select-trigger class="w-full md:w-36" aria-label="The version you use" />
              <iv-select-content>
                @for (v of older; track v) {
                  <iv-select-item [value]="v">{{ v }}</iv-select-item>
                }
              </iv-select-content>
            </iv-select>
          </div>

          @if (since(); as from) {
            <!-- Everything since your version, Changed first: an upgrade guide in one card. -->
            <section data-testid="digest" aria-labelledby="digest-title" class="docs-pane mt-8 p-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h2 id="digest-title" class="font-display text-foreground text-2xl font-medium tracking-[-0.02em]">Upgrading from {{ from }}</h2>
                  <p class="text-muted-foreground mt-1 text-sm">{{ behind() }} {{ behind() === 1 ? 'release' : 'releases' }} since. Read Changed first.</p>
                </div>
                <button ivButton type="button" variant="ghost" size="sm" (click)="since.set(null)">Close</button>
              </div>
              <!-- Changed is open: it is what to act on. The rest folds, with its count, so the card stays short. -->
              @for (g of digest(); track g.kind) {
                <details [attr.data-kind]="g.kind" class="group mt-5" [open]="g.kind === 'changed'">
                  <summary class="text-foreground flex cursor-pointer list-none items-center gap-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    <span class="size-2 shrink-0 rounded-[2px]" [class]="marks[g.kind]" aria-hidden="true"></span>
                    {{ g.label }}
                    <span class="text-muted-foreground font-normal tabular-nums">{{ g.notes.length }}</span>
                    <svg class="text-muted-foreground size-3.5 transition-transform duration-(--docs-dur) group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                  </summary>
                  <ul class="docs-prose docs-changelog-notes prose dark:prose-invert mt-2 max-w-[70ch]">
                    @for (n of g.notes; track $index) {
                      <li>
                        <span data-testid="digest-version" class="text-muted-foreground mr-1.5 rounded border px-1.5 py-px font-mono text-xs tabular-nums">{{ n.version }}</span>
                        <span [innerHTML]="n.html | trustedHtml"></span>
                      </li>
                    }
                  </ul>
                </details>
              }
              <div class="mt-6 flex flex-col gap-2 border-t pt-5 text-sm">
                <p class="text-muted-foreground">Installed the package:</p>
                <div data-testid="digest-command" class="docs-pane flex max-w-md items-center gap-3 py-1 pr-1 pl-4 font-mono text-[0.8125rem]">
                  <span class="min-w-0 flex-1 truncate">{{ npmCommand }}</span>
                  <docs-copy-button [text]="npmCommand" [label]="'Copy ' + npmCommand" />
                </div>
                <p class="text-muted-foreground mt-2">Copied the source: add each part again. This replaces your edits to it.</p>
                <div data-testid="digest-command" class="docs-pane flex max-w-md items-center gap-3 py-1 pr-1 pl-4 font-mono text-[0.8125rem]">
                  <span class="min-w-0 flex-1 truncate">{{ addCommand }}</span>
                  <docs-copy-button [text]="addCommand" [label]="'Copy ' + addCommand" />
                </div>
              </div>
            </section>
          }

          @if (!shown().length) {
            <div data-testid="no-match" class="flex flex-col items-center gap-4 py-20 text-center">
              <p class="text-foreground">No notes match "{{ query() }}".</p>
              <button ivButton type="button" variant="outline" size="sm" (click)="query.set('')">Clear search</button>
            </div>
          }

          <!-- The timeline: one hairline down the left, a node per release; the latest node in the accent. -->
          <div data-testid="timeline" class="relative mt-12 before:absolute before:top-2 before:bottom-0 before:left-[7px] before:w-px before:bg-(--docs-line)">
          @for (r of shown(); track r.version; let first = $first) {
            <article [attr.data-version]="r.version" class="relative pb-20 pl-10 last:pb-0">
              <span
                data-testid="node"
                class="absolute top-1 left-0 size-4 rounded-full border-4 border-(--docs-ground) ring-1 ring-(--docs-line)"
                [class]="r.version === latest ? 'bg-(--brand)' : 'bg-foreground'"
                aria-hidden="true"
              ></span>
              <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span class="text-foreground font-mono text-sm font-medium tabular-nums">v{{ r.version }}</span>
                <time class="text-muted-foreground font-mono text-xs tracking-[0.08em] uppercase" [attr.datetime]="r.date">{{ r.date | date: 'MMMM d, y' : 'UTC' }}</time>
              </div>
              <h2 class="group font-display text-foreground mt-3 scroll-mt-24 text-2xl font-medium tracking-[-0.03em] text-balance md:text-3xl" [id]="anchor(r.version)">
                {{ r.title }}
                <a
                  data-testid="permalink"
                  [routerLink]="[]"
                  [fragment]="anchor(r.version)"
                  [attr.aria-label]="'Link to ' + r.version"
                  class="text-muted-foreground hover:text-foreground ml-1 font-normal opacity-0 transition-opacity duration-(--docs-dur) group-hover:opacity-100 focus-visible:opacity-100"
                  >#</a
                >
              </h2>
              @if (kind() === 'all' && !query()) {
                  @if (r.version === '1.6.0') {
                    <!-- Real parts from this release: themes and dials, then the rich parts. Inert: a picture, not controls. -->
                    <div data-testid="release-visual" class="docs-pane mt-5 grid gap-5 p-5 sm:grid-cols-2" inert>
                      <div class="docs-specimen flex flex-col gap-2">
                        @for (t of themed(); track t.name) {
                          <div
                            [attr.data-theme]="t.name"
                            class="docs-preview flex items-center justify-between gap-3"
                            [class]="'theme-' + t.name + (t.name === siteTheme ? '' : ' docs-other')"
                            [style]="t.vars"
                          >
                            <span class="text-(--docs-ink-muted) text-sm">{{ t.label }}</span>
                            <button ivButton type="button" size="sm">Save changes</button>
                          </div>
                        }
                      </div>
                      <div class="flex flex-col justify-center gap-5">
                        <iv-meter [value]="68" label="Storage" valueText="68 GB of 100 GB" />
                        <div class="flex items-center justify-between gap-4 text-sm">
                          <span class="text-foreground font-medium">Signups</span>
                          <svg ivSparkline [data]="trend" type="area" class="h-8 w-32"></svg>
                          <span class="text-muted-foreground tabular-nums">1,204</span>
                        </div>
                      </div>
                    </div>
                  }
                  @if (r.version === '1.5.0') {
                    <!-- Charts arrived in 1.5.0: a live bar chart in the site's colors. Inert: a picture, not controls. -->
                    <div data-testid="release-visual" class="docs-pane mt-5 p-5" inert>
                      <p class="text-foreground text-sm font-medium">Deploys per month</p>
                      <iv-chart [config]="chartConfig" class="mt-3 h-40 w-full">
                        <svg ivBarChart [data]="chartData">
                          <g ivCartesianGrid [vertical]="false" />
                          <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="8" />
                          <g ivBar dataKey="deploys" [radius]="4" />
                        </svg>
                      </iv-chart>
                    </div>
                  }
                  @if (r.version === '1.4.0') {
                    <!-- Blocks arrived in 1.4.0: the first of each kind, as the CLI names them. -->
                    <div data-testid="release-visual" class="docs-pane mt-5 p-2" inert>
                      <iv-table>
                        <thead ivTableHeader>
                          <tr ivTableRow>
                            <th ivTableHead>Block</th>
                            <th ivTableHead>What it is</th>
                            <th ivTableHead class="text-right">Add it</th>
                          </tr>
                        </thead>
                        <tbody ivTableBody>
                          @for (b of blocks; track b.name) {
                            <tr ivTableRow>
                              <td ivTableCell class="font-mono">{{ b.name }}</td>
                              <td ivTableCell>{{ b.text }}</td>
                              <td ivTableCell class="text-muted-foreground text-right font-mono">ivorie add {{ b.name }}</td>
                            </tr>
                          }
                        </tbody>
                      </iv-table>
                    </div>
                  }
              }
              <!-- Changed first, boxed: what to do before upgrading. Then New, Improvements, Fixes; the mark's color says the kind. -->
              <div data-testid="groups" class="mt-8 grid gap-8 sm:grid-cols-2">
                @for (s of r.sections; track s.kind) {
                  <div [attr.data-kind]="s.kind" [class]="s.kind === 'changed' ? 'border border-amber-500/40 bg-amber-500/[0.06] p-4 sm:col-span-2' : 'min-w-0'">
                    <h3 [id]="sectionId(r.version, s.kind)" class="text-foreground flex items-center gap-2 text-sm font-medium">
                      <span class="size-2 shrink-0 rounded-[2px]" [class]="marks[s.kind]" aria-hidden="true"></span>
                      {{ s.kind === 'changed' ? 'Before you upgrade' : s.label }}
                    </h3>
                    <ul class="docs-prose docs-changelog-notes prose dark:prose-invert mt-2">
                      @for (item of s.items; track $index) {
                        <li [innerHTML]="item | trustedHtml"></li>
                      }
                    </ul>
                  </div>
                }
              </div>
            </article>
          }
          </div>
        </div>
      </div>

      <!-- What comes next closes the page: one hairline cell per planned release. -->
      <section aria-labelledby="next-title" class="mt-24">
        <h2 id="next-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em]">Up next</h2>
        <ul data-testid="next" class="mt-6 grid gap-px border bg-(--docs-line) md:grid-cols-2">
          @for (n of next; track n.version) {
            <li [attr.data-version]="n.version" class="flex flex-col gap-10 bg-(--docs-ground) p-6">
              <div class="flex items-center justify-between font-mono text-xs">
                <span class="text-foreground tabular-nums">v{{ n.version }}</span>
                <span class="text-muted-foreground tracking-[0.08em] uppercase">{{ n.status }}</span>
              </div>
              <p class="font-display text-foreground text-lg font-medium tracking-[-0.02em] text-pretty">{{ n.title }}</p>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export default class ChangelogPage {
  protected readonly releases = CHANGELOG;
  protected readonly latest = CHANGELOG[0].version;
  protected readonly stats = [
    { value: String(CHANGELOG.length), label: 'Releases' },
    { value: String(PAGES.filter((p) => p.section === 'component').length), label: 'Components' },
    { value: `v${CHANGELOG[0].version}`, label: 'Latest' },
  ];
  protected readonly next = NEXT;
  protected readonly siteTheme = DEFAULT_THEME;
  /** One color per kind, literal classes so Tailwind finds them. */
  protected readonly marks: Record<string, string> = {
    new: 'bg-primary',
    changed: 'bg-amber-500',
    improvements: 'bg-emerald-500',
    fixes: 'bg-muted-foreground',
  };
  protected sectionId(version: string, kind: string): string {
    return `${this.anchor(version)}-${kind}`;
  }
  protected anchor(version: string): string {
    return `v${version.replaceAll('.', '-')}`;
  }
  protected readonly kinds: { value: Kind; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'changed', label: 'Changed' },
    { value: 'improvements', label: 'Improvements' },
    { value: 'fixes', label: 'Fixes' },
  ];
  protected readonly kind = signal<Kind>('all');
  protected readonly query = signal('');
  /** The version you use; set, it opens the upgrade digest. */
  protected readonly since = signal<string | null>(null);
  protected readonly older = CHANGELOG.slice(1).map((r) => r.version);
  /** The release in view, for the rail. */
  protected readonly active = signal(CHANGELOG[0].version);
  protected readonly npmCommand = 'npm i @inlaylab/ivorie@latest';
  protected readonly addCommand = `${IVORIE} add button --overwrite`;

  /** Releases with notes of the picked kind that match the search, Changed first; matches marked. */
  protected readonly shown = computed(() => {
    const k = this.kind();
    const q = this.query().trim();
    return this.releases
      .map((r) => ({
        ...r,
        sections: [...r.sections]
          .filter((s) => k === 'all' || s.kind === k)
          .sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind))
          .map((s) => ({ ...s, items: s.items.filter((i) => plain(i).toLowerCase().includes(q.toLowerCase())).map((i) => markHtml(i, q)) }))
          .filter((s) => s.items.length),
      }))
      .filter((r) => r.sections.length);
  });

  protected readonly behind = computed(() => CHANGELOG.findIndex((r) => r.version === this.since()));
  /** Every note since your version, one group per kind, Changed first. */
  protected readonly digest = computed(() => {
    const newer = CHANGELOG.slice(0, Math.max(0, this.behind()));
    return ORDER.map((kind) => ({
      kind,
      label: LABELS[kind],
      notes: newer.flatMap((r) => r.sections.filter((s) => s.kind === kind).flatMap((s) => s.items.map((html) => ({ version: r.version, html })))),
    })).filter((g) => g.notes.length);
  });
  protected readonly pill =
    'has-checked:bg-primary has-checked:text-primary-foreground text-muted-foreground hover:text-foreground has-focus-visible:outline-ring relative shrink-0 cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors duration-(--docs-dur) has-focus-visible:outline-2';
  protected readonly trend = [12, 18, 15, 22, 28, 26, 34];
  protected readonly chartConfig: IvChartConfig = { deploys: { label: 'Deploys', color: 'var(--chart-2)' } };
  protected readonly chartData = [
    { month: 'Jun', deploys: 18 },
    { month: 'Jul', deploys: 24 },
    { month: 'Aug', deploys: 21 },
    { month: 'Sep', deploys: 32 },
    { month: 'Oct', deploys: 29 },
    { month: 'Nov', deploys: 38 },
  ];
  protected readonly blocks = [
    { name: 'login-01', text: 'A sign-in card with email and password' },
    { name: 'signup-01', text: 'An account form with validation' },
    { name: 'sidebar-01', text: 'An app shell with a collapsible sidebar' },
    { name: 'dashboard-01', text: 'Stats, a chart and a data table' },
  ];
  private readonly appearance = inject(Appearance);
  protected readonly themed = computed(() =>
    THEMED.map((name) => ({ name, label: THEME_INFO[name].label, vars: previewVars(THEMES[name], this.appearance.dark()) })),
  );

  constructor() {
    const look = inject(PlaygroundLook);
    afterNextRender(() => look.loadThemes(THEMED));
    // The rail follows the release in view. Filters change the articles, so observe again after each render of them.
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    afterRenderEffect((onCleanup) => {
      this.shown();
      if (typeof IntersectionObserver === 'undefined') return;
      const io = new IntersectionObserver(
        (entries) => {
          const hit = entries.find((e) => e.isIntersecting);
          const version = hit?.target.getAttribute('data-version');
          if (version) this.active.set(version);
        },
        { rootMargin: '-20% 0px -70% 0px' },
      );
      host.querySelectorAll('article[data-version]').forEach((a) => io.observe(a));
      onCleanup(() => io.disconnect());
    });
  }
}
