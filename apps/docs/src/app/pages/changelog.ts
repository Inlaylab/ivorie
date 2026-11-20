import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvMeter } from '@inlaylab/ivorie/meter';
import { IvSparkline } from '@inlaylab/ivorie/sparkline';
import { IV_CHART_IMPORTS, type IvChartConfig } from '@inlaylab/ivorie/chart';
import { IV_TABLE_IMPORTS } from '@inlaylab/ivorie/table';
import { CHANGELOG } from '../../generated/changelog';
import { THEMES, THEME_INFO, type ThemeName } from '../../generated/looks';
import { PlaygroundLook, previewVars } from '../playground/playground-look';
import { Appearance } from '../shell/appearance';
import { DEFAULT_THEME } from '../shell/appearance-options';
import { TrustedHtmlPipe } from '../ui/trusted-html.pipe';

/** 1.6.0's picture: the same button in four themes. */
const THEMED: ThemeName[] = ['slate', 'clay', 'bento', 'mono'];

/** What comes after the latest release. Keep in step with ROADMAP.md. */
const NEXT = [
  { version: '1.7.0', title: 'Ready for AI tools: AGENTS.md, llms.txt and an MCP server', status: 'Planned' },
  { version: '2.0.0', title: 'New themes; legacy themes and 1.x names removed', status: 'Planned' },
];

/** The changelog: every release from CHANGELOG.md, newest first. Version and date on the left, notes on the right. */
@Component({
  selector: 'docs-changelog',
  imports: [DatePipe, TrustedHtmlPipe, IvButton, IvMeter, IvSparkline, IV_CHART_IMPORTS, IV_TABLE_IMPORTS],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-20">
      <header class="max-w-2xl">
        <h1 class="font-display text-foreground text-4xl font-medium tracking-[-0.03em] sm:text-5xl">Changelog</h1>
        <p class="text-muted-foreground mt-4 text-lg text-pretty">
          What changed in each release of <code class="text-foreground font-mono text-base">&#64;inlaylab/ivorie</code> and the
          <code class="text-foreground font-mono text-base">ivorie</code> CLI. Both share one version.
        </p>
      </header>

      <section aria-labelledby="next-title" class="mt-12">
        <h2 id="next-title" class="text-foreground text-sm font-medium">Up next</h2>
        <ul data-testid="next" class="mt-3 border-t">
          @for (n of next; track n.version) {
            <li [attr.data-version]="n.version" class="grid gap-x-6 gap-y-1 border-b py-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-baseline">
              <span class="text-foreground font-mono text-sm tabular-nums">{{ n.version }}</span>
              <span class="text-foreground text-sm">{{ n.title }}</span>
              <span class="text-muted-foreground text-sm">{{ n.status }}</span>
            </li>
          }
        </ul>
      </section>

      <div class="mt-16 flex flex-col">
        @for (r of releases; track r.version) {
          <article [attr.data-version]="r.version" class="grid gap-x-10 gap-y-3 border-t py-10 md:grid-cols-[10rem_minmax(0,1fr)]">
            <div class="flex items-baseline gap-3 md:flex-col md:gap-1">
              <span class="font-display text-foreground text-2xl font-medium tracking-[-0.02em] tabular-nums">{{ r.version }}</span>
              <time class="text-muted-foreground text-sm tabular-nums" [attr.datetime]="r.date">{{ r.date | date: 'MMM d, y' }}</time>
            </div>
            <div class="min-w-0">
              <h2 class="font-display text-foreground text-xl font-medium tracking-[-0.01em] text-balance" [id]="'v' + r.version.replaceAll('.', '-')">
                {{ r.title }}
              </h2>
              @if (r.version === '1.6.0') {
                <!-- Real parts from this release: themes and dials, then the rich parts. Inert: a picture, not controls. -->
                <div data-testid="release-visual" class="docs-pane mt-5 grid gap-5 rounded-lg p-5 sm:grid-cols-2" inert>
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
                <div data-testid="release-visual" class="docs-pane mt-5 rounded-lg p-5" inert>
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
                <div data-testid="release-visual" class="docs-pane mt-5 rounded-lg p-2" inert>
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
              <div class="docs-prose prose dark:prose-invert mt-4 max-w-[70ch]" [innerHTML]="r.html | trustedHtml"></div>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export default class ChangelogPage {
  protected readonly releases = CHANGELOG;
  protected readonly next = NEXT;
  protected readonly siteTheme = DEFAULT_THEME;
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
  }
}
