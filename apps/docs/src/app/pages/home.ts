import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';
import { IV_TOOLTIP_IMPORTS } from '@inlaylab/ivorie/tooltip';
import { ACCENTS } from '../../generated/looks';
import { PAGES } from '../../generated/pages';
import { PlaygroundLook } from '../playground/playground-look';
import { SceneWall } from '../playground/scenes/wall';
import { STYLES } from '../shell/appearance-options';
import { STYLE_NOTES } from '../playground/look-controls';
import { CopyButton } from '../ui/copy-button';

@Component({
  selector: 'docs-home',
  imports: [RouterLink, IvButton, IV_TABS_IMPORTS, IV_TOOLTIP_IMPORTS, CopyButton, SceneWall],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <!-- Hero: centered under a soft beam of light. The install command is part of the pitch. -->
    <section aria-labelledby="hero-title" class="relative isolate overflow-hidden">
      <div class="docs-beam pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[44rem] max-w-5xl" aria-hidden="true"></div>
      <div class="mx-auto flex max-w-4xl flex-col items-center px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24">
        <a
          routerLink="/roadmap"
          class="docs-pane text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors duration-(--docs-dur)"
        >
          <span class="bg-(--brand-soft) text-(--brand-ink) rounded-full px-2 py-0.5 text-xs font-medium">{{ release.version }}</span>
          {{ release.text }}
        </a>
        <h1
          id="hero-title"
          class="font-display text-foreground text-[clamp(2.75rem,7.4vw,5.75rem)] leading-[1.02] font-semibold tracking-[-0.02em] text-balance"
        >
          Angular components you own.
        </h1>
        <p class="text-muted-foreground mt-6 max-w-[38rem] text-lg leading-relaxed text-pretty">
          Accessible, signal-based components for Angular 22. Install the package, or copy the source into your app and make it yours.
        </p>
        <div class="mt-9 flex flex-wrap justify-center gap-3">
          <a ivButton size="lg" class="rounded-full px-6" routerLink="/docs/installation">Get started</a>
          <a ivButton size="lg" variant="outline" class="docs-pane rounded-full px-6" routerLink="/playground">Open the playground</a>
        </div>
        <iv-tabs defaultValue="package" class="mt-8 w-full max-w-md items-center gap-2">
          <iv-tabs-list aria-label="How to install">
            <iv-tabs-trigger value="package">Package</iv-tabs-trigger>
            <iv-tabs-trigger value="source">Copy the source</iv-tabs-trigger>
          </iv-tabs-list>
          @for (i of installs; track i.value) {
            <iv-tabs-content [value]="i.value" class="w-full">
              <div class="docs-pane flex items-center gap-3 rounded-full py-1 pr-1 pl-5 text-left font-mono text-[0.8125rem]">
                <span class="min-w-0 flex-1 truncate"><span class="text-muted-foreground select-none">$ </span>{{ i.command }}</span>
                <docs-copy-button [text]="i.command" [label]="'Copy ' + i.command" />
              </div>
            </iv-tabs-content>
          }
        </iv-tabs>
      </div>
    </section>

    <!-- The showcase: real components in the picked style, on a horizon of light. Only the stage changes. -->
    <section aria-labelledby="wall-title" class="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <h2 id="wall-title" class="sr-only">Live components</h2>
      <div class="mb-5 flex flex-col items-center gap-3">
        <div role="radiogroup" aria-label="Style" class="docs-pane no-scrollbar relative flex max-w-full gap-0.5 overflow-x-auto rounded-full p-1">
          @for (s of styles; track s.name) {
            <iv-tooltip class="shrink-0" [delayDuration]="150">
              <label
                ivTooltipTrigger
                class="has-checked:bg-foreground has-checked:text-background text-muted-foreground hover:text-foreground has-focus-visible:outline-ring block cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors duration-(--docs-dur) has-focus-visible:outline-2"
              >
                <input
                  type="radio"
                  class="sr-only"
                  name="home-style"
                  [value]="s.name"
                  [attr.aria-description]="notes[s.name]"
                  [checked]="look.preset().style === s.name"
                  (change)="look.set({ style: s.name })"
                />
                {{ s.label }}
              </label>
              <iv-tooltip-content side="bottom">{{ notes[s.name] }}</iv-tooltip-content>
            </iv-tooltip>
          }
        </div>
        <!-- Accent: none (the base color's ink) or one of shadcn's accents. Charts follow it. -->
        <div role="radiogroup" aria-label="Accent" class="flex max-w-full flex-wrap justify-center gap-1.5 px-2">
          @for (a of accents; track a.name) {
            <label
              class="ring-offset-background has-checked:ring-foreground has-focus-visible:outline-ring flex size-5 cursor-pointer rounded-full ring-1 ring-black/10 ring-offset-2 transition-shadow has-checked:ring-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 dark:ring-white/15"
              [title]="a.title"
            >
              <input
                type="radio"
                class="sr-only"
                name="home-accent"
                [value]="a.name"
                [attr.aria-label]="a.title"
                [checked]="look.preset().theme === a.name"
                (change)="look.set({ theme: a.name })"
              />
              <span class="size-full rounded-full" [style.background]="a.color" aria-hidden="true"></span>
            </label>
          }
        </div>
      </div>

      <div class="relative isolate">
        <div class="docs-horizon pointer-events-none absolute inset-x-[4%] -top-32 -z-10 h-72" aria-hidden="true"></div>
        <div class="docs-pane relative overflow-hidden rounded-[1.75rem] p-1.5">
          <div #stage class="docs-stage bg-background relative max-h-[46rem] overflow-hidden rounded-[1.375rem] p-3 sm:p-5">
            <docs-scene-wall prefix="home" />
            <!-- The wall runs on; the fade ends it and leads to the full list. -->
            <div class="from-background via-background/90 absolute inset-x-0 bottom-0 flex h-48 items-end justify-center bg-linear-to-t to-transparent pb-6">
              <a ivButton variant="outline" class="rounded-full" routerLink="/docs/components">Browse all {{ componentCount }} components</a>
            </div>
          </div>
        </div>
      </div>

      <ul class="mt-12 grid gap-8 sm:grid-cols-3">
        @for (f of facts; track f.title) {
          <li class="flex flex-col gap-1.5 border-t pt-5">
            <span class="font-display text-foreground text-lg font-semibold tracking-tight">{{ f.title }}</span>
            <span class="text-muted-foreground text-sm text-pretty">{{ f.text }}</span>
          </li>
        }
      </ul>
    </section>

    <section aria-labelledby="ways-title" class="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <h2 id="ways-title" class="font-display text-foreground max-w-xl text-2xl font-semibold tracking-[-0.015em] text-balance sm:text-3xl">
        A package when you want updates. The source when you want control.
      </h2>
      <div class="mt-8 grid gap-4 md:grid-cols-2">
        @for (w of ways; track w.title) {
          <article class="docs-pane flex min-w-0 flex-col gap-5 rounded-3xl p-6 sm:p-8">
            <div class="flex flex-col gap-1.5">
              <h3 class="text-foreground text-lg font-semibold tracking-tight">{{ w.title }}</h3>
              <p class="text-muted-foreground text-sm text-pretty">{{ w.text }}</p>
            </div>
            <pre
              class="bg-background/60 overflow-x-auto rounded-2xl border p-4 font-mono text-[0.8125rem] leading-relaxed"
            ><code>{{ w.code }}</code></pre>
            <a [routerLink]="w.link" class="text-foreground mt-auto self-start text-sm font-medium underline-offset-4 hover:underline">{{
              w.linkLabel
            }}</a>
          </article>
        }
      </div>
    </section>

    <footer class="border-t">
      <div class="text-muted-foreground mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm sm:px-6">
        <span class="flex items-center gap-2">
          <span class="docs-brand-gradient size-1.5 rounded-full" aria-hidden="true"></span>
          <span
            >Ivorie is made by
            <a href="https://github.com/Inlaylab" target="_blank" rel="noreferrer" class="text-foreground font-medium hover:underline">Inlaylab</a>.
            MIT license.</span
          >
        </span>
        <nav aria-label="Footer" class="flex flex-wrap gap-x-5 gap-y-2">
          <a routerLink="/docs/components" class="hover:text-foreground">Components</a>
          <a routerLink="/blocks" class="hover:text-foreground">Blocks</a>
          <a routerLink="/roadmap" class="hover:text-foreground">Roadmap</a>
          <a href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" class="hover:text-foreground">Source on GitHub</a>
        </nav>
      </div>
    </footer>
  `,
})
export default class HomePage {
  protected readonly look = inject(PlaygroundLook);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  protected readonly componentCount = PAGES.filter((p) => p.section === 'component').length;
  /** The announcement pill. Update with each release. */
  protected readonly release = { version: '1.5.0', text: 'Charts, accent colors and new styles' };
  protected readonly styles = STYLES;
  protected readonly notes = STYLE_NOTES;
  protected readonly accents = [
    { name: 'base', title: 'No accent', color: 'var(--foreground)' },
    ...ACCENTS.map((a) => ({ name: a.name, title: a.title, color: a.light['--primary'] })),
  ];
  protected readonly installs = [
    { value: 'package', command: 'npm i @inlaylab/ivorie' },
    { value: 'source', command: 'npx ivorie init' },
  ];
  protected readonly facts = [
    { title: 'Signals and zoneless', text: 'Signal inputs and models, OnPush, no zone.js.' },
    { title: 'Server rendering', text: 'Renders on the server, hydrates without warnings.' },
    { title: 'Accessible', text: 'ARIA patterns, keyboard support, tested with axe.' },
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
      this.look.attach(this.stage().nativeElement);
      this.look.attach(overlays.getContainerElement());
    });
  }
}
