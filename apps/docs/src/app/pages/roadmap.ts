import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';

type State = 'shipped' | 'next' | 'planned';

/** Oldest first. Keep in step with ROADMAP.md (phase order), in words a user cares about. */
export const ROADMAP: {
  title: string;
  summary: string;
  state: State;
  version?: string;
  link?: string;
}[] = [
  {
    title: 'Components and the CLI',
    summary:
      'Accordion to tooltip, each with its own import. Install the package, or copy the source into your app with npx ivorie.',
    state: 'shipped',
    version: '1.0',
    link: '/docs/installation',
  },
  {
    title: 'More components',
    summary:
      'Command, sheet, slider, carousel, drawer and a dozen more, plus one page to browse them all.',
    state: 'shipped',
    version: '1.1',
    link: '/docs/components',
  },
  {
    title: 'Playground',
    summary:
      'Pick a style, color, font and radius. See real components change, then install that look with one command.',
    state: 'shipped',
    version: '1.2',
    link: '/playground',
  },
  {
    title: 'Icon libraries',
    summary:
      'Pick Lucide, Tabler, Phosphor, Hugeicons or Remix in the playground or with the CLI, and every component follows. npx ivorie migrate icons moves your own icons too.',
    state: 'shipped',
    version: '1.3',
    link: '/docs/icon',
  },
  {
    title: 'More styles',
    summary:
      "Five new looks next to shadcn's five: Glass (frosted panes), Brutal (ink frames), Aurora (gradient glow), Bento (tonal tiles) and Mono (flat, a terminal caret).",
    state: 'shipped',
    version: '1.4',
    link: '/playground',
  },
  {
    title: 'Data table',
    summary:
      'Sort, page and filter rows, and select them, in the browser or on your server. Built on the table you already use.',
    state: 'shipped',
    version: '1.4',
    link: '/docs/data-table',
  },
  {
    title: 'Blocks',
    summary:
      'Ready-made sign-in, sign-up, sidebar and dashboard pages, wired to forms and the data table. Add one with a single command, then change it however you like.',
    state: 'shipped',
    version: '1.4',
    link: '/blocks',
  },
  {
    title: 'A new site',
    summary: 'A new home page with a wall of live components, an easier playground and blocks you can browse by category.',
    state: 'shipped',
    version: '1.4.1',
    link: '/',
  },
  {
    title: 'Radius and font in every style',
    summary: 'The radius and font you pick reach every component in every style, Mono included.',
    state: 'shipped',
    version: '1.4.1',
    link: '/playground',
  },
  {
    title: 'Charts',
    summary:
      'Line, area, bar, pie, radar and radial charts that follow your theme, render on the server and work with the keyboard. 70 examples.',
    state: 'shipped',
    version: '1.5',
    link: '/docs/chart',
  },
  {
    title: 'Dashboard blocks',
    summary: 'Four ready-made dashboards with charts, stat cards and tables: documents, analytics, sales and product usage.',
    state: 'shipped',
    version: '1.5',
    link: '/blocks',
  },
  {
    title: 'Accent colors and new styles',
    summary: "shadcn's 17 accents with colored charts, the lyra, mira and sera styles, and a neutral glass with edges drawn with light. Aurora and Brutal are gone.",
    state: 'shipped',
    version: '1.5',
    link: '/playground',
  },
  {
    title: 'More theme dials',
    summary: 'Density and glass material dials in the playground and the CLI.',
    state: 'next',
    version: '1.6',
    link: '/playground',
  },
  {
    title: 'Ready for AI coding tools',
    summary:
      'An AGENTS.md guide and an MCP server, so your AI assistant uses the right imports and adds components for you.',
    state: 'planned',
    version: '1.7',
    link: '/docs/mcp',
  },
];

/** `/roadmap`: one timeline. The future on top (planned, then up next), then what shipped, newest first. */
@Component({
  selector: 'docs-roadmap',
  imports: [RouterLink, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-5xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header class="max-w-xl">
        <h1 class="font-display text-foreground text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.025em]">Roadmap</h1>
        <p class="text-muted-foreground mt-4 text-lg text-pretty">
          What is out, and what we are building next, one release at a time. The order can change as we learn what you need.
        </p>
      </header>

      <ol class="mt-14 flex flex-col" aria-label="Releases, newest on top">
        <!-- Planned: furthest first. A dashed card on a faint line. -->
        @for (item of planned; track item.title) {
          <li [class]="row">
            <h2 [class]="version + ' text-muted-foreground'"><span class="sr-only">Release </span>{{ item.version }}</h2>
            <span class="flex flex-col items-center" aria-hidden="true">
              <span class="bg-background mt-1.5 size-2.5 shrink-0 rounded-full border border-(--docs-ink-muted)"></span>
              <span class="my-1.5 w-px flex-1 bg-(--docs-line)"></span>
            </span>
            <article class="mb-8 flex flex-col gap-1 rounded-2xl border border-dashed p-4 sm:p-5" data-state="planned">
              <span class="text-muted-foreground text-xs font-medium">Planned</span>
              <h3 class="text-foreground font-semibold tracking-tight">{{ item.title }}</h3>
              <p class="text-muted-foreground text-sm text-pretty">{{ item.summary }}</p>
            </article>
          </li>
        }

        <!-- Up next: the release in progress. The line turns violet from here down. -->
        <li [class]="row">
          <h2 [class]="version + ' text-foreground font-semibold'"><span class="sr-only">Release </span>{{ next.version }}</h2>
          <span class="flex flex-col items-center" aria-hidden="true">
            <span class="relative mt-1 flex size-3.5 shrink-0">
              <span class="docs-ring-once absolute inset-0 rounded-full bg-(--brand)"></span>
              <span class="relative size-3.5 rounded-full bg-(--brand) ring-4 ring-(--brand-soft)"></span>
            </span>
            <span class="my-1.5 w-0.5 flex-1 bg-(--brand)"></span>
          </span>
          <article
            class="docs-pane relative isolate mb-10 flex flex-col gap-3 overflow-hidden rounded-2xl p-5 sm:p-7"
            style="border-color: color-mix(in oklab, var(--brand) 45%, transparent)"
            data-state="next"
          >
            <div class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(36rem_14rem_at_100%_0%,var(--docs-glow-a),transparent_70%)]" aria-hidden="true"></div>
            <span class="self-start rounded-full bg-(--brand-soft) px-2.5 py-0.5 text-xs font-medium text-(--brand-ink)">Up next</span>
            <h3 class="font-display text-foreground text-2xl font-semibold tracking-[-0.02em] text-balance">{{ next.title }}</h3>
            <p class="text-muted-foreground text-pretty">{{ next.summary }}</p>
          </article>
        </li>

        <!-- Shipped: one row per release, its items as tiles. -->
        @for (release of shipped; track release.version; let last = $last) {
          <li [class]="row" data-testid="release">
            <h2 [class]="version + ' text-foreground'"><span class="sr-only">Release </span>{{ release.version }}</h2>
            <span class="flex flex-col items-center" aria-hidden="true">
              <span class="mt-1.5 size-2.5 shrink-0 rounded-full bg-(--brand)"></span>
              @if (!last) {
                <span class="my-1.5 w-0.5 flex-1 bg-(--brand)/50"></span>
              }
            </span>
            <ul class="grid gap-3 sm:grid-cols-2" [class.pb-8]="!last">
              @for (item of release.items; track item.title) {
                <li class="docs-pane group rounded-2xl" data-state="shipped">
                  @if (item.link) {
                    <a [routerLink]="item.link" class="focus-visible:ring-ring flex h-full flex-col gap-1 rounded-2xl p-4 outline-none focus-visible:ring-2">
                      <h3 class="text-foreground flex items-center justify-between gap-3 font-semibold tracking-tight">
                        {{ item.title }}
                        <svg class="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform duration-(--docs-dur) group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </h3>
                      <p class="text-muted-foreground text-sm text-pretty">{{ item.summary }}</p>
                    </a>
                  } @else {
                    <div class="flex flex-col gap-1 p-4">
                      <h3 class="text-foreground font-semibold tracking-tight">{{ item.title }}</h3>
                      <p class="text-muted-foreground text-sm text-pretty">{{ item.summary }}</p>
                    </div>
                  }
                </li>
              }
            </ul>
          </li>
        }
      </ol>

      <div class="docs-pane mt-16 flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 class="text-foreground text-lg font-semibold tracking-tight">Missing something you need?</h2>
          <p class="text-muted-foreground text-sm">Tell us what to build. Issues shape the order above.</p>
        </div>
        <a ivButton href="https://github.com/Inlaylab/ivorie/issues" target="_blank" rel="noreferrer" class="rounded-full">Open an issue on GitHub</a>
      </div>
    </div>
  `,
})
export default class RoadmapPage {
  protected readonly next = ROADMAP.find((i) => i.state === 'next')!;
  /** Furthest first: the timeline runs from the future down. */
  protected readonly planned = ROADMAP.filter((i) => i.state === 'planned').reverse();
  /** A timeline row: version, the line, the content. */
  protected readonly row = 'grid grid-cols-[3rem_1rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[4.5rem_1rem_minmax(0,1fr)] sm:gap-x-5';
  protected readonly version = 'pt-0.5 text-right font-mono text-sm tabular-nums';
  /** Shipped items grouped by release, newest release first. */
  protected readonly shipped = [...new Set(ROADMAP.filter((i) => i.state === 'shipped').map((i) => i.version!))]
    .reverse()
    .map((version) => ({ version, items: ROADMAP.filter((i) => i.state === 'shipped' && i.version === version) }));

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'What Ivorie has shipped and what comes next.',
    });
  }
}
