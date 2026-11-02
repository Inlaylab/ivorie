import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IvProgress } from '@inlaylab/ivorie/progress';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';
import { PAGES } from '../../generated/pages';
import { LookControls } from '../playground/look-controls';
import { PlaygroundLook } from '../playground/playground-look';
import { DEFAULT_PRESET, encodePreset } from '../playground/preset-code';
import { CopyButton } from '../ui/copy-button';

const DEFAULT_CODE = encodePreset(DEFAULT_PRESET);

@Component({
  selector: 'docs-home',
  imports: [
    RouterLink,
    IV_AVATAR_IMPORTS,
    IvBadge,
    IvButton,
    IV_CARD_IMPORTS,
    IV_FIELD_IMPORTS,
    IV_INPUT_IMPORTS,
    IvProgress,
    IvSwitch,
    IV_TABS_IMPORTS,
    CopyButton,
    LookControls,
  ],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="relative isolate overflow-hidden">
      <!-- The one bold move: soft brand light behind the hero. -->
      <div class="docs-aurora pointer-events-none absolute inset-x-0 -top-40 -z-10 mx-auto h-[46rem] max-w-6xl opacity-80 dark:opacity-60" aria-hidden="true"></div>

      <div class="mx-auto flex max-w-4xl flex-col items-center px-4 pt-14 text-center sm:px-6 sm:pt-20 lg:pt-24">
        <a
          href="https://github.com/Inlaylab"
          target="_blank"
          rel="noreferrer"
          class="bg-background/70 text-muted-foreground hover:text-foreground mb-7 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm backdrop-blur transition-colors"
        >
          <span class="docs-brand-gradient size-2 rounded-full" aria-hidden="true"></span>
          Open source by <span class="text-foreground font-medium">Inlaylab</span>
        </a>
        <h1 class="text-foreground text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance">
          Angular components you own.
        </h1>
        <p class="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed text-pretty sm:text-xl">
          Accessible, signal-based components for Angular 22. Install the package, or copy the source into your app
          and make it yours.
        </p>
        <div class="mt-9 flex flex-wrap justify-center gap-3">
          <a ivButton size="lg" class="rounded-full px-6" routerLink="/docs/installation">Get started</a>
          <a ivButton size="lg" variant="outline" class="bg-background/70 rounded-full px-6 backdrop-blur" routerLink="/playground">Open the playground</a>
        </div>
        <iv-tabs defaultValue="package" class="mt-8 w-full max-w-md items-center">
          <iv-tabs-list aria-label="How to install">
            <iv-tabs-trigger value="package">Package</iv-tabs-trigger>
            <iv-tabs-trigger value="source">Copy the source</iv-tabs-trigger>
          </iv-tabs-list>
          @for (i of installs; track i.value) {
            <iv-tabs-content [value]="i.value" class="w-full">
              <div class="bg-background/70 flex items-center gap-3 rounded-full border py-1 pr-1 pl-5 text-left font-mono text-[0.8125rem] backdrop-blur">
                <span class="min-w-0 flex-1 truncate"><span class="text-muted-foreground select-none">$ </span>{{ i.command }}</span>
                <docs-copy-button [text]="i.command" [label]="'Copy ' + i.command" />
              </div>
            </iv-tabs-content>
          }
        </iv-tabs>
      </div>

      <!-- Real components. The controls under them re-skin only this frame. -->
      <figure class="docs-gradient-border mx-auto mt-16 mb-20 max-w-6xl overflow-hidden rounded-[1.75rem] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] sm:mx-6 lg:mx-auto">
        <div #stage class="docs-stage bg-background grid gap-4 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-3">
          <iv-card>
            <iv-card-header>
              <iv-card-title>Release checklist</iv-card-title>
              <iv-card-description>Ships when every gate is green.</iv-card-description>
            </iv-card-header>
            <iv-card-content class="flex flex-1 flex-col gap-4">
              <iv-progress [value]="done() * 25" aria-label="Release progress" />
              @for (gate of gates; track gate.label; let i = $index) {
                <label class="flex items-center justify-between gap-4 text-sm">
                  <span class="flex items-center gap-2">
                    {{ gate.label }}
                    @if (gate.new) {
                      <iv-badge variant="secondary">new</iv-badge>
                    }
                  </span>
                  <iv-switch [checked]="i < done()" (checkedChange)="toggle(i, $event)" />
                </label>
              }
            </iv-card-content>
            <iv-card-footer class="justify-end gap-2">
              <button ivButton variant="ghost" size="sm" (click)="done.set(0)">Reset</button>
              <button ivButton size="sm" [disabled]="done() < gates.length">Publish</button>
            </iv-card-footer>
          </iv-card>

          <iv-card>
            <iv-card-header>
              <iv-card-title>Invite your team</iv-card-title>
              <iv-card-description>They get access to this project only.</iv-card-description>
            </iv-card-header>
            <iv-card-content class="flex flex-1 flex-col gap-4">
              <iv-field>
                <label ivLabel for="home-email">Email</label>
                <input ivInput id="home-email" type="email" autocomplete="email" placeholder="ada@example.com" />
              </iv-field>
              <div class="flex flex-col gap-3">
                @for (m of team; track m.name) {
                  <div class="flex items-center gap-3">
                    <iv-avatar size="sm"><iv-avatar-fallback>{{ m.initials }}</iv-avatar-fallback></iv-avatar>
                    <span class="flex-1 text-sm">{{ m.name }}</span>
                    <iv-badge variant="outline">{{ m.role }}</iv-badge>
                  </div>
                }
              </div>
            </iv-card-content>
            <iv-card-footer>
              <button ivButton class="w-full">Send invite</button>
            </iv-card-footer>
          </iv-card>

          <iv-card class="md:col-span-2 lg:col-span-1">
            <iv-card-header>
              <iv-card-title>Usage</iv-card-title>
              <iv-card-description>Builds this week.</iv-card-description>
            </iv-card-header>
            <iv-card-content class="flex flex-1 flex-col gap-4">
              <div class="flex h-32 items-end gap-2" role="img" aria-label="Builds per day, Monday to Sunday: 12, 18, 9, 22, 27, 14, 8">
                @for (b of bars; track $index) {
                  <div class="bg-primary/85 flex-1 rounded-t-[calc(var(--radius)*0.6)]" [style.height.%]="b"></div>
                }
              </div>
              <div class="text-muted-foreground flex justify-between text-xs">
                @for (d of days; track $index) {
                  <span class="flex-1 text-center">{{ d }}</span>
                }
              </div>
              <div class="flex items-center justify-between border-t pt-4 text-sm">
                <span class="text-muted-foreground">Total</span>
                <span class="font-medium tabular-nums">110 builds</span>
              </div>
            </iv-card-content>
          </iv-card>
        </div>
        <figcaption class="bg-card flex flex-col gap-4 border-t p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <docs-look-controls compact [look]="look" name="home" class="gap-4 sm:flex-row sm:items-start sm:gap-8" />
          <div class="flex flex-col items-start gap-1 text-sm sm:items-end">
            <span class="text-muted-foreground">Only this frame changes.</span>
            <a routerLink="/playground" [queryParams]="playgroundQuery()" class="text-foreground font-medium underline-offset-4 hover:underline">
              Fonts and radius in the playground
            </a>
          </div>
        </figcaption>
      </figure>
    </section>

    <section aria-labelledby="ways-title" class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h2 id="ways-title" class="text-foreground max-w-xl text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
        A package when you want updates. The source when you want control.
      </h2>
      <div class="mt-10 grid gap-4 md:grid-cols-2">
        @for (w of ways; track w.title) {
          <article class="bg-card flex flex-col gap-5 rounded-3xl border p-6 sm:p-8">
            <div class="flex flex-col gap-1.5">
              <h3 class="text-foreground text-lg font-semibold tracking-tight">{{ w.title }}</h3>
              <p class="text-muted-foreground text-sm text-pretty">{{ w.text }}</p>
            </div>
            <pre class="bg-muted/60 overflow-x-auto rounded-2xl border p-4 font-mono text-[0.8125rem] leading-relaxed"><code>{{ w.code }}</code></pre>
            <a [routerLink]="w.link" class="text-foreground mt-auto self-start text-sm font-medium underline-offset-4 hover:underline">{{ w.linkLabel }}</a>
          </article>
        }
      </div>
      <ul class="mt-12 grid gap-8 sm:grid-cols-3">
        @for (f of facts; track f.title) {
          <li class="flex flex-col gap-1.5 border-t pt-5">
            <span class="text-foreground font-medium">{{ f.title }}</span>
            <span class="text-muted-foreground text-sm text-pretty">{{ f.text }}</span>
          </li>
        }
      </ul>
    </section>

    <section aria-labelledby="components-title" class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="components-title" class="text-foreground text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Components</h2>
          <p class="text-muted-foreground mt-2">{{ components.length }} components, each its own entry point.</p>
        </div>
        <a ivButton variant="outline" class="rounded-full" routerLink="/docs/components">Browse with previews</a>
      </div>
      <ul class="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
        @for (page of components; track page.slug) {
          <li class="border-b">
            <a
              [routerLink]="['/docs', page.slug]"
              class="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex rounded-sm py-2.5 text-sm transition-colors outline-none focus-visible:ring-2"
              >{{ page.title }}</a
            >
          </li>
        }
      </ul>
    </section>

    <footer class="border-t">
      <div class="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm sm:px-6">
        <span class="flex items-center gap-2">
          <span class="docs-brand-gradient size-1.5 rounded-full" aria-hidden="true"></span>
          <span>Ivorie is made by <a href="https://github.com/Inlaylab" target="_blank" rel="noreferrer" class="text-foreground font-medium hover:underline">Inlaylab</a>. MIT license.</span>
        </span>
        <a href="https://github.com/Inlaylab/ivorie" target="_blank" rel="noreferrer" class="hover:text-foreground">Source on GitHub</a>
      </div>
    </footer>
  `,
})
export default class HomePage {
  protected readonly look = inject(PlaygroundLook);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  protected readonly components = PAGES.filter((p) => p.section === 'component');
  protected readonly installs = [
    { value: 'package', command: 'npm i @inlaylab/ivorie' },
    { value: 'source', command: 'npx ivorie init' },
  ];
  protected readonly ways = [
    {
      title: 'Install the package',
      text: 'Updates come with npm. Import only what you use: every component is its own entry point.',
      code: "import { IvButton } from '@inlaylab/ivorie/button';\n\n<button ivButton variant=\"outline\">Save</button>",
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
  protected readonly facts = [
    { title: 'Signals and zoneless', text: 'Signal inputs and models, OnPush, no zone.js needed.' },
    { title: 'Server rendering', text: 'Every component renders on the server and hydrates without warnings.' },
    { title: 'Keyboard and screen readers', text: 'Focus, roles and labels follow the ARIA patterns. Tested with axe.' },
  ];
  protected readonly team = [
    { name: 'Ada Lovelace', initials: 'AL', role: 'Owner' },
    { name: 'Grace Hopper', initials: 'GH', role: 'Editor' },
  ];
  protected readonly bars = [44, 67, 33, 81, 100, 52, 30];
  protected readonly days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  protected readonly gates = [
    { label: 'Unit tests', new: false },
    { label: 'SSR smoke', new: true },
    { label: 'Package smoke', new: true },
    { label: 'CI', new: false },
  ];
  protected readonly done = signal(2);
  protected readonly playgroundQuery = computed(() =>
    this.look.code() === DEFAULT_CODE ? {} : { preset: this.look.code() },
  );

  constructor() {
    afterNextRender(() => this.look.attach(this.stage().nativeElement));
  }

  protected toggle(i: number, on: boolean): void {
    this.done.set(on ? i + 1 : i);
  }
}
