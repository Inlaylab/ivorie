import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, resource, signal, viewChild } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command';
import { IvKbd } from '@inlaylab/ivorie/kbd';
import { BLOCKS } from '../../generated/blocks';
import { CHANGELOG } from '../../generated/changelog';
import { DEMOS } from '../../generated/demos';
import { THEME_ORDER } from '../../generated/looks';
import { PAGES } from '../../generated/pages';
import { PlaygroundLook } from '../playground/playground-look';
import { SceneWall } from '../playground/scenes/wall';
import { ThemePicker } from '../playground/theme-picker';
import { COFFEE_URL } from '../shell/site-header';
import { GROUPS } from '../shell/site-nav';
import { CopyButton } from '../ui/copy-button';
import { TrustedHtmlPipe } from '../ui/trusted-html.pipe';
import { DocsHeroMark } from '../ui/line-art/hero-mark';
import { DocsLineSignals } from '../ui/line-art/signals';
import { DocsLineInstall } from '../ui/line-art/install';
import { DocsLineThemes } from '../ui/line-art/themes';
import { DocsLineKeys } from '../ui/line-art/keys';
import { DocsLineAgents } from '../ui/line-art/agents';
import { IVORIE } from '../../generated/cli';

/** Component families for "Components for every screen": a nav group, a sentence, and where to start reading. */
const FAMILIES: { group: string; title: string; text: string; link: string }[] = [
  { group: 'Forms and inputs', title: 'Forms', text: 'Fields, selects, date pickers and switches that work with reactive and signal forms.', link: '/docs/field' },
  { group: 'Overlays and menus', title: 'Overlays', text: 'Dialogs, sheets, menus, popovers and toasts, with focus that goes where it should.', link: '/docs/dialog' },
  { group: 'Data display', title: 'Data', text: 'Tables, charts and badges for the screens people read every day.', link: '/docs/data-table' },
  { group: 'Metrics', title: 'Metrics', text: 'Meters, gauges, stat tiles and trackers for dashboards.', link: '/docs/stat' },
  { group: 'Layout and navigation', title: 'Layout', text: 'Sidebars, tabs, breadcrumbs and cards that hold an app together.', link: '/docs/sidebar' },
];

/** Small counts as words, for headings ("eleven looks"); larger ones stay digits. */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

@Component({
  selector: 'docs-home',
  imports: [
    RouterLink, NgComponentOutlet, IvButton, IvSkeleton, IvKbd, IV_COMMAND_IMPORTS, TrustedHtmlPipe,
    ThemePicker, CopyButton, SceneWall,
    DocsHeroMark, DocsLineSignals, DocsLineInstall, DocsLineThemes, DocsLineKeys, DocsLineAgents,
  ],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <!-- The inlay frame: one container with a hairline rail down each side; each section after the hero
         opens with a divider and a + where it crosses the rails. -->
    <div class="docs-rail">
      <!-- Hero: what Ivorie is and one way in on the left; the mark drawn like a pen-tool outline on the right. -->
      <section aria-labelledby="hero-title" class="relative grid items-center lg:min-h-[36rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div class="docs-grid-fade pointer-events-none absolute inset-0" aria-hidden="true"></div>
        <div class="relative flex flex-col items-start gap-6 px-6 pt-16 pb-10 sm:px-12 lg:py-24">
          <a
            routerLink="/changelog"
            [fragment]="releaseAnchor"
            data-testid="release"
            class="docs-pane text-muted-foreground hover:text-foreground inline-flex min-h-9 max-w-full items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors duration-(--docs-dur)"
          >
            <span class="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">v{{ release.version }}</span>
            <span class="truncate">{{ release.title }}</span>
          </a>
          <h1
            id="hero-title"
            class="font-display text-foreground max-w-[13ch] text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.98] font-medium tracking-[-0.04em] text-balance"
          >
            Angular components, set into your app.
          </h1>
          <p class="text-muted-foreground max-w-[34rem] text-lg leading-relaxed text-pretty" data-testid="hero-sub">
            shadcn/ui behavior on Angular signals. {{ componentCount }} components, {{ themeCount }} themes, one codebase. Install the package, or let the CLI copy the source into your app.
          </p>
          <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <a ivButton size="lg" routerLink="/docs/installation" class="max-sm:w-full">Get started</a>
            <div class="docs-pane flex h-10 w-full items-center gap-3 rounded-md py-1 pr-1 pl-4 font-mono text-[0.8125rem] sm:max-w-xs">
              <span class="min-w-0 flex-1 truncate" data-testid="hero-command"><span class="text-muted-foreground select-none">$ </span>{{ install }}</span>
              <docs-copy-button [text]="install" [label]="'Copy ' + install" />
            </div>
          </div>
        </div>
        <div class="relative flex justify-center px-10 pb-16 sm:px-16 lg:py-16">
          <docs-hero-mark class="w-full max-w-[26rem]" [count]="componentCount" />
        </div>
      </section>

      <!-- The product: the theme tiles, then a wall of live cards in the theme you pick. -->
      <section aria-labelledby="wall-title" class="docs-sec px-4 py-20 sm:px-8 lg:py-24">
        <div class="flex flex-col items-center gap-4 text-center">
          <h2 id="wall-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Pick a theme. The code stays.</h2>
          <p data-testid="same-code" class="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-sm">
            Same code in every theme
            <code class="bg-muted text-foreground rounded-md border px-3 py-1 font-mono text-[0.8125rem]">{{ sameCode }}</code>
          </p>
          <docs-theme-picker chips class="mt-4 w-full" [look]="look" name="home" />
        </div>
        <!-- The first cards of the wall, as many as fit the width (docs-wall-short); the full set is in the playground.
             overflow-clip: the wall's sticky backdrop stays inside the stage (clip, unlike hidden, keeps it sticky). -->
        <div #wall data-testid="wall-stage" class="docs-stage docs-wall-short relative mt-8 overflow-clip rounded-xl p-2">
          <!-- After the first paint: the wall is many live cards. Until then, a hairline grid holds its place. -->
          @defer (on idle) {
            <docs-scene-wall prefix="home" [charts]="false" />
          } @placeholder {
            <div data-testid="wall-placeholder" class="grid h-[32rem] grid-cols-1 gap-px bg-(--docs-line) sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
              @for (i of placeholderCells; track i) {
                <div class="bg-(--docs-ground)"></div>
              }
            </div>
          }
        </div>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a ivButton variant="outline" routerLink="/docs/components">Browse all {{ componentCount }} components</a>
          <a ivButton variant="ghost" routerLink="/playground">Open the playground</a>
        </div>
      </section>

      <!-- How it works: one idea per cell, each drawn the way the code works. -->
      <section aria-labelledby="how-title" class="docs-sec">
        <div class="flex flex-col gap-3 px-6 pt-20 pb-12 sm:px-12 lg:pt-24">
          <p class="docs-eyebrow">How it works</p>
          <h2 id="how-title" class="font-display text-foreground max-w-[20ch] text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Four ideas, drawn the way the code works.</h2>
        </div>
        <div class="docs-cells">
          <div class="flex flex-col gap-3 p-6 sm:p-12">
            <docs-line-signals />
            <h3 class="text-foreground mt-2 text-xl font-medium tracking-[-0.02em]">Signals in, signals out</h3>
            <p class="text-muted-foreground text-pretty">Bind with <code class="font-mono text-sm">[(checked)]</code>, ngModel or signal forms. OnPush everywhere, no zone.js.</p>
          </div>
          <div class="flex flex-col gap-3 p-6 sm:p-12">
            <docs-line-install />
            <h3 class="text-foreground mt-2 text-xl font-medium tracking-[-0.02em]">Install it, or own it</h3>
            <p class="text-muted-foreground text-pretty">Same code either way. The CLI writes the source into your app, so you can change anything.</p>
          </div>
          <div class="flex flex-col gap-3 p-6 sm:p-12">
            <docs-line-themes />
            <h3 class="text-foreground mt-2 text-xl font-medium tracking-[-0.02em]">One markup, {{ themeWord }} looks</h3>
            <p class="text-muted-foreground text-pretty">The look lives in theme CSS behind <code class="font-mono text-sm">cn-*</code> hooks. Switch the file, keep the template.</p>
          </div>
          <div class="flex flex-col gap-3 p-6 sm:p-12">
            <docs-line-keys />
            <h3 class="text-foreground mt-2 text-xl font-medium tracking-[-0.02em]">Keyboard first, axe checked</h3>
            <p class="text-muted-foreground text-pretty">Focus and ARIA follow Radix. Every spec runs axe, and pages hydrate after SSR without warnings.</p>
          </div>
        </div>
      </section>

      <!-- Keyboard, live: the keys you press in the menu light up beside it. -->
      <section aria-labelledby="keys-title" class="docs-sec">
        <div class="grid items-center gap-12 px-6 py-20 sm:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:py-24" (keydown)="press($event)">
          <div class="flex flex-col gap-5">
            <h2 id="keys-title" class="font-display text-foreground max-w-xl text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Every part works from the keyboard</h2>
            <p class="text-muted-foreground max-w-md text-pretty">Arrow keys move, Enter picks, Escape leaves, and typing filters. Try it in the menu.</p>
            <div class="flex flex-wrap gap-2" aria-hidden="true">
              @for (k of keys; track k.key) {
                <kbd
                  ivKbd
                  [attr.data-key]="k.key"
                  [attr.data-pressed]="pressed() === k.key ? '' : null"
                  class="docs-pane text-foreground data-pressed:bg-primary data-pressed:text-primary-foreground data-pressed:border-primary h-9 min-w-9 px-2.5 text-sm transition-colors duration-100"
                  >{{ k.label }}</kbd
                >
              }
            </div>
          </div>
          <iv-command class="rounded-xl border">
            <iv-command-input placeholder="Type a command or search…" aria-label="Commands" />
            <iv-command-list>
              <iv-command-empty>No commands match.</iv-command-empty>
              <iv-command-group heading="File">
                <iv-command-item>Rename</iv-command-item>
                <iv-command-item>Duplicate</iv-command-item>
                <iv-command-item>Move to project</iv-command-item>
              </iv-command-group>
              <iv-command-separator />
              <iv-command-group heading="Share">
                <iv-command-item>Copy link</iv-command-item>
                <iv-command-item>Invite people</iv-command-item>
              </iv-command-group>
            </iv-command-list>
          </iv-command>
        </div>
      </section>

      <!-- The numbers, from the generated data. Cells split by hairlines: the grid's gap shows its ground. -->
      <section aria-labelledby="numbers-title" class="docs-sec">
        <h2 id="numbers-title" class="sr-only">Ivorie in numbers</h2>
        <dl class="grid grid-cols-2 gap-px bg-(--docs-line) lg:grid-cols-4">
          @for (n of numbers; track n.label) {
            <div data-testid="number" class="flex flex-col gap-1 bg-(--docs-ground) px-6 py-10 sm:px-12">
              <dt class="text-muted-foreground font-mono text-xs">{{ n.label }}</dt>
              <dd class="font-display text-foreground order-first text-5xl font-medium tracking-[-0.04em] tabular-nums">{{ n.value }}</dd>
            </div>
          }
        </dl>
      </section>

      <!-- The code you copy, beside what it renders, in the theme picked above. -->
      <section aria-labelledby="code-title" class="docs-sec px-6 py-20 sm:px-12 lg:py-24">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="flex max-w-xl flex-col gap-3">
            <h2 id="code-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">The code you copy is the code you see</h2>
            <p class="text-muted-foreground text-pretty">Import a part from the package, or let the CLI write its source into your app. Either way it is this file.</p>
          </div>
          <div role="radiogroup" aria-label="Example" class="docs-pane no-scrollbar flex w-fit max-w-full gap-0.5 overflow-x-auto rounded-full p-1">
            @for (t of codeTabs; track t.name) {
              <label [class]="pill">
                <input type="radio" class="sr-only" name="home-code" [value]="t.name" [checked]="codeTab() === t.name" (change)="codeTab.set(t.name)" />
                {{ t.label }}
              </label>
            }
          </div>
        </div>
        <div class="docs-pane mt-8 grid overflow-hidden rounded-xl lg:grid-cols-2">
          <div class="docs-code relative min-w-0 border-b lg:border-r lg:border-b-0">
            @if (example.value(); as ex) {
              <docs-copy-button class="absolute top-2 right-2 z-10" [text]="ex.source.raw" />
              <div data-testid="code-source" class="max-h-112 overflow-auto" [innerHTML]="ex.source.code | trustedHtml"></div>
            } @else {
              <iv-skeleton class="block h-80 w-full rounded-none" />
            }
          </div>
          <div
            #codeStage
            data-testid="code-result"
            class="docs-stage docs-preview docs-demo flex min-h-80 min-w-0 items-center justify-center overflow-x-auto p-6 *:grid *:w-full *:grid-cols-1 *:justify-items-center"
          >
            @if (example.value(); as ex) {
              <ng-container [ngComponentOutlet]="ex.demo" />
            }
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <div class="docs-pane flex w-full max-w-sm items-center gap-3 rounded-md py-1 pr-1 pl-4 font-mono text-[0.8125rem]">
            <span class="min-w-0 flex-1 truncate" data-testid="code-command"><span class="text-muted-foreground select-none">$ </span>{{ codeCommand() }}</span>
            <docs-copy-button [text]="codeCommand()" [label]="'Copy ' + codeCommand()" />
          </div>
          <a routerLink="/docs/cli" class="text-foreground inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">CLI guide</a>
        </div>
      </section>

      <!-- The families, as hairline rows. Each names its parts and where to start. -->
      <section aria-labelledby="families-title" class="docs-sec grid gap-10 px-6 py-20 sm:px-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:py-24">
        <div class="flex flex-col gap-4">
          <h2 id="families-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Components for every screen</h2>
          <p class="text-muted-foreground text-pretty">Every part an app needs, ported from shadcn/ui with its classes, variants and keyboard behavior.</p>
        </div>
        <ul class="border-t">
          @for (f of families; track f.title) {
            <li class="grid gap-x-8 gap-y-1 border-b py-5 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-baseline">
              <a [routerLink]="f.link" class="font-display text-foreground text-2xl font-medium tracking-[-0.02em] underline-offset-4 hover:underline">{{ f.title }}</a>
              <p class="text-muted-foreground text-sm text-pretty">{{ f.text }}</p>
              <span class="text-muted-foreground font-mono text-xs tabular-nums">{{ f.count }} parts</span>
            </li>
          }
        </ul>
      </section>

      <!-- Next: what 1.7 brings, drawn as the path a coding agent takes. -->
      <section aria-labelledby="next-title" class="docs-sec grid items-center gap-8 px-6 py-20 sm:px-12 lg:grid-cols-2 lg:py-24">
        <div class="flex flex-col items-start gap-3">
          <p class="docs-eyebrow">Next · 1.7</p>
          <h2 id="next-title" class="font-display text-foreground text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Agents that know Ivorie</h2>
          <p class="text-muted-foreground max-w-[30rem] text-pretty">AGENTS.md, llms.txt and an MCP server, so coding agents write the right imports and add parts with the CLI.</p>
          <a routerLink="/changelog" class="text-foreground inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline">Follow the changelog</a>
        </div>
        <docs-line-agents class="mx-auto w-full max-w-md" />
      </section>

      <!-- Close: one line, one command, one action. Then a way to support the work. -->
      <section aria-labelledby="close-title" class="docs-sec flex flex-col items-start gap-6 px-6 py-20 sm:px-12 lg:flex-row lg:items-end lg:justify-between lg:py-24">
        <div class="flex flex-col gap-4">
          <h2 id="close-title" class="font-display text-foreground max-w-[18ch] text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl">Install Ivorie with one command</h2>
          <p class="text-muted-foreground text-sm">
            Free and MIT licensed. If it saves you time,
            <a [href]="coffee" target="_blank" rel="noreferrer" data-testid="coffee" class="text-foreground font-medium underline underline-offset-4">buy me a coffee</a>.
          </p>
        </div>
        <!-- One column, one width: the command and the button share both edges. -->
        <div class="flex w-full flex-col gap-3 sm:w-80">
          <div class="docs-pane flex w-full items-center gap-3 rounded-md py-1 pr-1 pl-4 font-mono text-[0.8125rem]">
            <span class="min-w-0 flex-1 truncate"><span class="text-muted-foreground select-none">$ </span>{{ install }}</span>
            <docs-copy-button [text]="install" [label]="'Copy ' + install" />
          </div>
          <a ivButton routerLink="/docs/installation" class="w-full">Read the installation guide</a>
        </div>
      </section>
    </div>
  `,
})
export default class HomePage {
  protected readonly look = inject(PlaygroundLook);
  private readonly wall = viewChild.required<ElementRef<HTMLElement>>('wall');
  protected readonly install = `${IVORIE} init`;
  protected readonly sameCode = '<button ivButton>Save</button>';
  protected readonly placeholderCells = [0, 1, 2, 3, 4, 5, 6, 7];
  protected readonly componentCount = PAGES.filter((p) => p.section === 'component').length;
  protected readonly themeCount = THEME_ORDER.length;
  protected readonly themeWord = WORDS[THEME_ORDER.length] ?? String(THEME_ORDER.length);
  protected readonly coffee = COFFEE_URL;
  /** The line over the hero: the latest release from CHANGELOG.md, linked to its notes. */
  protected readonly release = CHANGELOG[0];
  protected readonly releaseAnchor = `v${CHANGELOG[0].version.replaceAll('.', '-')}`;
  protected readonly families = FAMILIES.map((f) => ({ ...f, count: GROUPS.find((g) => g.label === f.group)?.pages.length ?? 0 }));
  /** Counts from the generated data. The last is a rule every part follows: no zone.js. */
  protected readonly numbers = [
    { value: String(this.componentCount), label: 'Components' },
    { value: String(this.themeCount), label: 'Themes' },
    { value: String(BLOCKS.length), label: 'Blocks' },
    { value: '0', label: 'zone.js' },
  ];
  private readonly codeStage = viewChild.required<ElementRef<HTMLElement>>('codeStage');

  /** Keys the keyboard section lights; the label is what the keycap shows. */
  protected readonly keys = [
    { key: 'ArrowUp', label: '↑' },
    { key: 'ArrowDown', label: '↓' },
    { key: 'Enter', label: 'Enter' },
    { key: 'Escape', label: 'Esc' },
    { key: 'Tab', label: 'Tab' },
  ];
  protected readonly pressed = signal<string | null>(null);
  private pressTimer?: ReturnType<typeof setTimeout>;
  protected press(event: KeyboardEvent): void {
    if (!this.keys.some((k) => k.key === event.key)) return;
    this.pressed.set(event.key);
    clearTimeout(this.pressTimer);
    this.pressTimer = setTimeout(() => this.pressed.set(null), 160);
  }

  /** "Code beside its result": a demo's real source (from its docs page) and the demo itself. */
  protected readonly codeTabs = [
    { name: 'button', label: 'Button' },
    { name: 'dialog', label: 'Dialog' },
    { name: 'data-table', label: 'Data table' },
  ];
  protected readonly codeTab = signal('button');
  protected readonly codeCommand = computed(() => `${IVORIE} add ${this.codeTab()}`);
  protected readonly example = resource({
    params: () => this.codeTab(),
    loader: async ({ params }) => {
      const [page, demo] = await Promise.all([PAGES.find((p) => p.slug === params)!.load(), DEMOS[params]()]);
      return { source: page.demos[params], demo };
    },
  });

  protected readonly pill =
    'has-checked:bg-primary has-checked:text-primary-foreground text-muted-foreground hover:text-foreground has-focus-visible:outline-ring relative shrink-0 cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors duration-(--docs-dur) has-focus-visible:outline-2';

  constructor() {
    // The wall's dialogs, menus and popovers open in the overlay container: they get the look too.
    const overlays = inject(OverlayContainer);
    afterNextRender(() => {
      this.look.attach(this.wall().nativeElement);
      this.look.attach(this.codeStage().nativeElement);
      this.look.attach(overlays.getContainerElement());
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.pressTimer));
  }
}
