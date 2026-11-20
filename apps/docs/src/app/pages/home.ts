import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { THEMES, THEME_INFO, THEME_ORDER, type ThemeName } from '../../generated/looks';
import { PAGES } from '../../generated/pages';
import { PlaygroundLook, previewVars } from '../playground/playground-look';
import { SceneWall } from '../playground/scenes/wall';
import { ThemePicker } from '../playground/theme-picker';
import { Appearance } from '../shell/appearance';
import { DEFAULT_THEME } from '../shell/appearance-options';
import { GROUPS } from '../shell/site-nav';
import { CopyButton } from '../ui/copy-button';
import { IVORIE } from '../../generated/cli';

/** The hero specimen: one button and one switch, set in five themes that differ most. */
const SPECIMEN: ThemeName[] = ['slate', 'clay', 'bento', 'luma', 'mono'];

/** Component families for "What it does": a nav group, a sentence, and where to start reading. */
const FAMILIES: { group: string; title: string; text: string; link: string }[] = [
  { group: 'Forms and inputs', title: 'Forms', text: 'Fields, selects, date pickers and switches that work with reactive and signal forms.', link: '/docs/field' },
  { group: 'Overlays and menus', title: 'Overlays', text: 'Dialogs, sheets, menus, popovers and toasts, with focus that goes where it should.', link: '/docs/dialog' },
  { group: 'Data display', title: 'Data', text: 'Tables, charts and badges for the screens people read every day.', link: '/docs/data-table' },
  { group: 'Metrics', title: 'Metrics', text: 'Meters, gauges, stat tiles and trackers for dashboards.', link: '/docs/stat' },
  { group: 'Layout and navigation', title: 'Layout', text: 'Sidebars, tabs, breadcrumbs and cards that hold an app together.', link: '/docs/sidebar' },
];

@Component({
  selector: 'docs-home',
  imports: [RouterLink, IvButton, IvSwitch, ThemePicker, CopyButton, SceneWall],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <!-- Hero: what Ivorie is, the counts, two ways forward. The specimen shows the pitch: one component, many themes. -->
    <section aria-labelledby="hero-title" class="border-b">
      <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:py-20">
        <div class="flex min-w-0 flex-col items-start" data-enter>
          <a
            href="https://github.com/Inlaylab/ivorie"
            target="_blank"
            rel="noreferrer"
            class="text-muted-foreground hover:text-foreground mb-8 inline-flex min-h-11 items-center gap-2 text-sm"
          >
            <span class="text-foreground font-medium tabular-nums">v{{ release.version }}</span>
            {{ release.text }}
          </a>
          <h1
            id="hero-title"
            class="font-display text-foreground max-w-[14ch] text-[clamp(2.75rem,6.4vw,5.25rem)] leading-[0.98] font-medium tracking-[-0.04em] text-balance"
          >
            Angular components, set in any theme.
          </h1>
          <p class="text-muted-foreground mt-6 max-w-[34rem] text-lg leading-relaxed text-pretty" data-testid="hero-sub">
            shadcn/ui behavior for Angular 22. {{ componentCount }} components, {{ themeCount }} themes, one codebase. Install the package or copy the source.
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <a ivButton size="lg" routerLink="/docs/installation">Get started</a>
            <a ivButton size="lg" variant="outline" routerLink="/playground">Open the playground</a>
          </div>
          <div class="bg-muted mt-6 flex w-full max-w-xs items-center gap-3 rounded-md border py-1 pr-1 pl-4 text-left font-mono text-[0.8125rem]">
            <span class="min-w-0 flex-1 truncate" data-testid="hero-command"><span class="text-muted-foreground select-none">$ </span>{{ install }}</span>
            <docs-copy-button [text]="install" [label]="'Copy ' + install" />
          </div>
        </div>

        <!-- The specimen: the same live button and switch, set in five themes. Each row is a preview in its own theme. -->
        <!-- A picture of five themes, not five more actions: inert, so it takes no focus and no clicks. -->
        <div data-testid="specimen" class="docs-specimen min-w-0 border-t" inert>
          @for (s of specimen(); track s.name) {
            <div
              [attr.data-theme]="s.name"
              class="docs-preview grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 border-b px-1 py-4 sm:grid-cols-[8rem_minmax(0,1fr)]"
              [class]="'theme-' + s.name + (s.name === siteTheme ? '' : ' docs-other')"
              [style]="s.vars"
            >
              <!-- The site's muted ink, resolved at the root: the theme around it cannot pull it under contrast. -->
              <span class="text-(--docs-ink-muted) text-sm">{{ s.label }}</span>
              <div class="flex items-center justify-end gap-4">
                <iv-switch [checked]="true" [aria-label]="'Notify the team, ' + s.label" />
                <button ivButton type="button">Save changes</button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- What it does: the families, set as a list. Each names its parts and where to start. -->
    <section aria-labelledby="does-title" class="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div class="flex flex-col gap-4">
          <h2 id="does-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Components for every screen</h2>
          <p class="text-muted-foreground text-pretty">Every part an app needs, ported from shadcn/ui with its classes, variants and keyboard behavior.</p>
          <a routerLink="/docs/components" class="text-foreground mt-2 inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">Browse all {{ componentCount }} components</a>
        </div>
        <ul class="border-t">
          @for (f of families; track f.title) {
            <li class="grid gap-x-8 gap-y-1 border-b py-5 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-baseline">
              <a [routerLink]="f.link" class="font-display text-foreground text-2xl font-medium tracking-[-0.02em] hover:underline underline-offset-4">{{ f.title }}</a>
              <p class="text-muted-foreground text-sm text-pretty">{{ f.text }}</p>
              <span class="text-muted-foreground text-sm tabular-nums">{{ f.count }} parts</span>
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- Why it helps: plain claims a reader can check in the docs. -->
    <section aria-labelledby="why-title" class="bg-muted/40 border-y">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <h2 id="why-title" class="font-display text-foreground max-w-xl text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Signals, SSR and accessibility built in</h2>
        <dl class="mt-12 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          @for (b of benefits; track b.title) {
            <div class="flex flex-col gap-1.5 border-t pt-4">
              <dt class="text-foreground font-medium">{{ b.title }}</dt>
              <dd class="text-muted-foreground text-sm text-pretty">{{ b.text }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <!-- Themes: real components in the picked theme. Only the stage changes; the code under the picker never does. -->
    <section aria-labelledby="themes-title" class="mx-auto max-w-[88rem] px-4 py-24 sm:px-6">
      <div class="mb-8 flex flex-col items-center gap-3 text-center">
        <h2 id="themes-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">One code, {{ themeCount }} themes</h2>
        <p class="text-muted-foreground max-w-xl text-pretty">Pick a theme. The components below change their surfaces, edges and controls. Your markup stays the same.</p>
      </div>
      <div class="mb-5 flex flex-col items-center">
        <docs-theme-picker class="w-full" [look]="look" name="home" />
        <p data-testid="same-code" class="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          Same code in every theme
          <code class="bg-muted text-foreground rounded-md border px-3 py-1 font-mono text-[0.8125rem]">{{ sameCode }}</code>
        </p>
      </div>

      <!-- The cards sit on the page itself. The stage only carries the picked look. -->
      <!-- The first cards of the wall, as many as fit the width (docs-wall-short); the full set is in the playground. -->
      <div #stage class="docs-stage docs-wall-short relative rounded-lg p-2">
        <docs-scene-wall prefix="home" [charts]="false" />
      </div>
      <div class="mt-6 flex justify-center">
        <a ivButton variant="outline" routerLink="/docs/components">Browse all {{ componentCount }} components</a>
      </div>
    </section>

    <section aria-labelledby="ways-title" class="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <h2 id="ways-title" class="font-display text-foreground max-w-xl text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">
        Install the package or copy the source
      </h2>
      <div class="mt-10 grid gap-4 md:grid-cols-2">
        @for (w of ways; track w.title) {
          <article class="docs-pane flex min-w-0 flex-col gap-5 rounded-lg p-6 sm:p-8">
            <div class="flex flex-col gap-1.5">
              <h3 class="text-foreground text-lg font-semibold tracking-tight">{{ w.title }}</h3>
              <p class="text-muted-foreground text-sm text-pretty">{{ w.text }}</p>
            </div>
            <pre class="bg-background rounded-md border p-4 font-mono text-[0.8125rem] leading-relaxed break-all whitespace-pre-wrap"><code>{{ w.code }}</code></pre>
            <a [routerLink]="w.link" class="text-foreground mt-auto inline-flex min-h-11 items-center self-start text-sm font-medium underline-offset-4 hover:underline">{{
              w.linkLabel
            }}</a>
          </article>
        }
      </div>
    </section>

    <!-- Close: one line, one command, one action. -->
    <section aria-labelledby="close-title" class="border-t">
      <div class="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 id="close-title" class="font-display text-foreground max-w-[18ch] text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Install Ivorie with one command</h2>
        <div class="flex flex-col items-start gap-3">
          <div class="bg-muted flex w-full max-w-xs items-center gap-3 rounded-md border py-1 pr-1 pl-4 font-mono text-[0.8125rem]">
            <span class="min-w-0 flex-1 truncate"><span class="text-muted-foreground select-none">$ </span>{{ install }}</span>
            <docs-copy-button [text]="install" [label]="'Copy ' + install" />
          </div>
          <a ivButton routerLink="/docs/installation">Read the installation guide</a>
        </div>
      </div>
    </section>
  `,
})
export default class HomePage {
  protected readonly look = inject(PlaygroundLook);
  private readonly appearance = inject(Appearance);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  protected readonly install = `${IVORIE} init`;
  protected readonly sameCode = '<button ivButton>Save</button>';
  protected readonly componentCount = PAGES.filter((p) => p.section === 'component').length;
  protected readonly themeCount = THEME_ORDER.length;
  protected readonly siteTheme = DEFAULT_THEME;
  /** The line over the hero: the current version, and that the code is open. Bump the version with each release. */
  protected readonly release = { version: '1.6.0', text: 'Free and open source on GitHub' };
  protected readonly specimen = computed(() =>
    SPECIMEN.map((name) => ({ name, label: THEME_INFO[name].label, vars: previewVars(THEMES[name], this.appearance.dark()) })),
  );
  protected readonly families = FAMILIES.map((f) => ({ ...f, count: GROUPS.find((g) => g.label === f.group)?.pages.length ?? 0 }));
  protected readonly benefits = [
    { title: 'Signals and zoneless', text: 'Signal inputs and models, OnPush everywhere, no zone.js.' },
    { title: 'Server rendering', text: 'Renders on the server and hydrates without warnings.' },
    { title: 'Accessible', text: 'ARIA patterns and keyboard support, tested with axe.' },
    { title: 'Import only what you use', text: 'Every component is its own entry point: @inlaylab/ivorie/button.' },
    { title: 'Own the code', text: 'The CLI copies the source into your app. Change it like your own.' },
    { title: 'Themes without rewrites', text: 'Switch theme, accent, font or density. The component code stays the same.' },
  ];
  protected readonly ways = [
    {
      title: 'Install the package',
      text: 'Updates come with npm. Import only what you use: every component is its own entry point.',
      code: 'import { IvButton } from \'@inlaylab/ivorie/button\';\n\n<button ivButton variant="outline">Save</button>',
      link: '/docs/installation',
      linkLabel: 'Installation guide',
    },
    {
      title: 'Copy the source',
      text: 'The CLI writes the component files into your app. Read them, change them, keep them.',
      code: '$ npx ivorie add button\n\nsrc/app/ui/button/button.ts\nsrc/app/ui/button/public-api.ts',
      link: '/docs/cli',
      linkLabel: 'CLI guide',
    },
  ];

  constructor() {
    // The wall's dialogs, menus and popovers open in the overlay container: they get the look too.
    const overlays = inject(OverlayContainer);
    afterNextRender(() => {
      this.look.loadThemes(SPECIMEN);
      this.look.attach(this.stage().nativeElement);
      this.look.attach(overlays.getContainerElement());
    });
  }
}
