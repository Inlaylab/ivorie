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
    title: 'Radius and font in every style',
    summary: 'The radius and font you pick reach every component in every style, Mono included.',
    state: 'shipped',
    version: '1.4.1',
    link: '/playground',
  },
  {
    title: 'A new site',
    summary: 'A new home page with a wall of live components, an easier playground and blocks you can browse by category.',
    state: 'next',
    version: '1.4.2',
  },
  {
    title: 'Glass material and theme dials',
    summary: 'A richer glass style, plus accent, chart color, density and material dials in the playground and the CLI.',
    state: 'planned',
    version: '1.5',
    link: '/playground',
  },
  {
    title: 'Charts',
    summary: 'Line, area, bar and pie charts that follow your theme and render on the server.',
    state: 'planned',
    version: '1.6',
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

/** `/roadmap`: what is next first, then what is planned, then what shipped, newest first. */
@Component({
  selector: 'docs-roadmap',
  imports: [RouterLink, IvButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-xl">
          <h1 class="text-foreground text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.04em]">Roadmap</h1>
          <p class="text-muted-foreground mt-4 text-lg text-pretty">
            What is out, and what we are building next, one release at a time. The order can change as we learn what you need.
          </p>
        </div>
        <dl class="docs-pane grid grid-cols-3 divide-x divide-(--docs-line) rounded-2xl" data-testid="counts">
          @for (c of counts; track c.label) {
            <div class="flex flex-col-reverse gap-0.5 px-5 py-3 sm:px-6">
              <dt class="text-muted-foreground text-sm">{{ c.label }}</dt>
              <dd class="text-foreground text-2xl font-semibold tabular-nums">{{ c.count }}</dd>
            </div>
          }
        </dl>
      </header>

      <!-- Up next: the one release in progress. -->
      <section aria-labelledby="next-title" class="mt-14">
        <h2 id="next-title" class="text-foreground mb-4 flex items-center gap-2.5 text-sm font-medium">
          <span class="relative flex size-2.5" aria-hidden="true">
            <span class="docs-ring-once absolute inset-0 rounded-full bg-(--brand)"></span>
            <span class="relative size-2.5 rounded-full bg-(--brand)"></span>
          </span>
          Up next
        </h2>
        <article class="docs-pane relative isolate overflow-hidden rounded-3xl p-6 sm:p-10" data-state="next">
          <div class="docs-next-glow pointer-events-none absolute inset-0 -z-10" aria-hidden="true"></div>
          <div class="flex flex-col gap-4 sm:max-w-2xl">
            <span class="self-start rounded-full bg-(--brand-soft) px-2.5 py-0.5 font-mono text-xs font-medium text-(--brand-ink)">{{ next.version }}</span>
            <h3 class="text-foreground text-2xl font-semibold tracking-[-0.03em] text-balance sm:text-3xl">{{ next.title }}</h3>
            <p class="text-muted-foreground text-lg text-pretty">{{ next.summary }}</p>
          </div>
        </article>
      </section>

      <!-- Planned: after that, in order. -->
      <section aria-labelledby="planned-title" class="mt-14">
        <h2 id="planned-title" class="text-foreground mb-4 text-sm font-medium">Planned</h2>
        <ol class="grid gap-4 md:grid-cols-3">
          @for (item of planned; track item.title) {
            <li class="docs-pane flex flex-col gap-3 rounded-2xl p-5 sm:p-6" data-state="planned">
              <span class="text-muted-foreground self-start rounded-full border px-2.5 py-0.5 font-mono text-xs">{{ item.version }}</span>
              <h3 class="text-foreground text-lg font-semibold tracking-tight">{{ item.title }}</h3>
              <p class="text-muted-foreground text-sm text-pretty">{{ item.summary }}</p>
            </li>
          }
        </ol>
      </section>

      <!-- Shipped: newest first, grouped by release. -->
      <section aria-labelledby="shipped-title" class="mt-16">
        <h2 id="shipped-title" class="text-foreground mb-6 text-sm font-medium">Shipped</h2>
        <ol class="flex flex-col">
          @for (release of shipped; track release.version; let last = $last) {
            <li class="grid grid-cols-[3.5rem_1rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[6rem_1rem_minmax(0,1fr)] sm:gap-x-4">
              <span class="text-foreground pt-0.5 text-right font-mono text-sm font-medium tabular-nums">{{ release.version }}</span>
              <span class="flex flex-col items-center" aria-hidden="true">
                <span class="mt-1.5 size-2.5 shrink-0 rounded-full bg-(--brand) ring-4 ring-(--brand-soft)"></span>
                @if (!last) {
                  <span class="my-1.5 w-px flex-1 bg-(--docs-line)"></span>
                }
              </span>
              <ul class="flex flex-col gap-3" [class.pb-10]="!last">
                @for (item of release.items; track item.title) {
                  <li class="docs-pane group rounded-2xl" data-state="shipped">
                    @if (item.link) {
                      <a [routerLink]="item.link" class="focus-visible:ring-ring flex flex-col gap-1 rounded-2xl p-4 outline-none focus-visible:ring-2 sm:p-5">
                        <h3 class="text-foreground flex items-center justify-between gap-3 font-semibold tracking-tight">
                          {{ item.title }}
                          <svg class="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-transform duration-(--docs-dur) group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </h3>
                        <p class="text-muted-foreground text-sm text-pretty">{{ item.summary }}</p>
                      </a>
                    } @else {
                      <div class="flex flex-col gap-1 p-4 sm:p-5">
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
      </section>

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
  protected readonly planned = ROADMAP.filter((i) => i.state === 'planned');
  /** Shipped items grouped by release, newest release first. */
  protected readonly shipped = [...new Set(ROADMAP.filter((i) => i.state === 'shipped').map((i) => i.version!))]
    .reverse()
    .map((version) => ({ version, items: ROADMAP.filter((i) => i.state === 'shipped' && i.version === version) }));
  protected readonly counts = [
    { label: 'Shipped', count: ROADMAP.filter((i) => i.state === 'shipped').length },
    { label: 'Up next', count: 1 },
    { label: 'Planned', count: this.planned.length },
  ];

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'What Ivorie has shipped and what comes next.',
    });
  }
}
