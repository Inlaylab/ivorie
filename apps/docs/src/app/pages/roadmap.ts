import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IvBadge } from '@inlaylab/ivorie/badge';

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
    state: 'next',
    version: '1.3',
    link: '/docs/icon',
  },
  {
    title: 'More styles',
    summary:
      "Five new looks next to shadcn's five: Glass (frosted panes), Brutal (ink frames), Aurora (gradient glow), Bento (tonal tiles) and Mono (monospace, square).",
    state: 'planned',
    version: '1.4',
    link: '/playground',
  },
  {
    title: 'Data table',
    summary:
      'Sort, page and filter rows, and select them, in the browser or on your server. Built on the table you already use.',
    state: 'planned',
    version: '1.4',
  },
  {
    title: 'Blocks',
    summary:
      'Ready-made sign-in, sign-up, sidebar and dashboard pages, wired to forms and the data table. Add one with a single command, then change it however you like.',
    state: 'planned',
    version: '1.4',
    link: '/blocks',
  },
  {
    title: 'Ready for AI coding tools',
    summary:
      'An AGENTS.md guide and an MCP server, so your AI assistant uses the right imports and adds components for you.',
    state: 'planned',
    version: '1.5',
    link: '/docs/mcp',
  },
  {
    title: 'Charts',
    summary: 'Line, area, bar and pie charts that follow your theme and render on the server.',
    state: 'planned',
    version: '1.6',
  },
];

const STATE_LABEL: Record<State, string> = {
  shipped: 'Shipped',
  next: 'Up next',
  planned: 'Planned',
};

/** `/roadmap`: one rail, oldest at the top. The line is solid where we have shipped and dashed ahead. */
@Component({
  selector: 'docs-roadmap',
  imports: [RouterLink, IvBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-2xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header class="mb-12">
        <h1
          class="text-foreground text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-semibold tracking-[-0.04em]"
        >
          Roadmap
        </h1>
        <p class="text-muted-foreground mt-4 text-lg text-pretty">
          What is out, and what we are building next, one release at a time. The order can change as
          we learn what you need.
        </p>
      </header>

      <ol class="flex flex-col">
        @for (item of items; track item.title; let last = $last) {
          <li
            class="relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-4"
            [attr.data-state]="item.state"
          >
            <!-- Rail: the dot, then the line down to the next item. -->
            <div class="flex flex-col items-center" aria-hidden="true">
              @switch (item.state) {
                @case ('shipped') {
                  <span class="docs-brand-gradient mt-1.5 size-3 shrink-0 rounded-full"></span>
                }
                @case ('next') {
                  <span class="relative mt-1 flex size-4 shrink-0 items-center justify-center">
                    <span
                      class="docs-ring-once ring-foreground/40 absolute inset-0 rounded-full ring-2"
                    ></span>
                    <span
                      class="bg-background ring-foreground size-4 rounded-full ring-2 ring-inset"
                    ></span>
                  </span>
                }
                @default {
                  <span
                    class="bg-background ring-muted-foreground/45 mt-1.5 size-3 shrink-0 rounded-full ring-2 ring-inset"
                  ></span>
                }
              }
              @if (!last) {
                @if (item.state === 'shipped') {
                  <span class="docs-brand-gradient my-1 w-px flex-1"></span>
                } @else {
                  <span
                    class="border-muted-foreground/35 my-1 flex-1 border-l-2 border-dotted"
                  ></span>
                }
              }
            </div>

            <div class="flex flex-col gap-1.5" [class.pb-10]="!last">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-foreground text-lg font-semibold tracking-tight">
                  @if (item.link) {
                    <a
                      [routerLink]="item.link"
                      class="focus-visible:ring-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2"
                      >{{ item.title }}</a
                    >
                  } @else {
                    {{ item.title }}
                  }
                </h2>
                @if (item.version) {
                  <span class="text-muted-foreground text-sm tabular-nums">{{ item.version }}</span>
                }
                @if (item.state === 'next') {
                  <iv-badge>Up next</iv-badge>
                }
                <span class="sr-only">{{ item.state === 'next' ? '' : label[item.state] }}</span>
              </div>
              <p class="text-muted-foreground max-w-[60ch] text-pretty">{{ item.summary }}</p>
            </div>
          </li>
        }
      </ol>

      <p class="text-muted-foreground mt-14 border-t pt-6 text-sm">
        Missing something you need?
        <a
          href="https://github.com/Inlaylab/ivorie/issues"
          target="_blank"
          rel="noreferrer"
          class="text-foreground font-medium underline-offset-4 hover:underline"
          >Open an issue on GitHub</a
        >.
      </p>
    </div>
  `,
})
export default class RoadmapPage {
  protected readonly items = ROADMAP;
  protected readonly label = STATE_LABEL;

  constructor() {
    inject(Meta).updateTag({
      name: 'description',
      content: 'What Ivorie has shipped and what comes next.',
    });
  }
}
