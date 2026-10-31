import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IvProgress } from '@inlaylab/ivorie/progress';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { PAGES } from '../../generated/pages';
import { CopyButton } from '../ui/copy-button';

@Component({
  selector: 'docs-home',
  imports: [
    RouterLink,
    IvBadge,
    IvButton,
    IV_CARD_IMPORTS,
    IV_FIELD_IMPORTS,
    IV_INPUT_IMPORTS,
    IvProgress,
    IvSwitch,
    CopyButton,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex flex-col items-center pt-6 pb-14 text-center sm:pt-12">
      <a
        routerLink="/docs/cli"
        class="bg-muted/60 text-foreground hover:bg-muted mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
      >
        <span class="bg-foreground size-1.5 rounded-full" aria-hidden="true"></span>
        New in v1.0: copy components with npx ivorie
      </a>
      <h1 class="text-foreground max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
        Angular components you can read and change
      </h1>
      <p class="text-muted-foreground mt-5 max-w-2xl text-base text-balance sm:text-lg">
        The shadcn/ui look and behavior for Angular 22. Signals, server rendering and keyboard support built in.
        Install the package or copy the source.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-2">
        <a ivButton routerLink="/docs/installation">Get started</a>
        <a ivButton variant="ghost" routerLink="/docs/accordion">Browse components</a>
      </div>
      <div class="bg-muted/60 mt-6 inline-flex items-center gap-3 rounded-lg border py-1 pr-1 pl-4 font-mono text-[0.8125rem]">
        <span><span class="text-muted-foreground select-none">$ </span>npm i &#64;ivorie/ui</span>
        <docs-copy-button text="npm i @inlaylab/ivorie" label="Copy install command" />
      </div>
    </section>

    <!-- Real components, not pictures of them. -->
    <section aria-label="Examples" class="grid gap-4 pb-16 md:grid-cols-2">
      <iv-card>
        <iv-card-header>
          <iv-card-title>Release checklist</iv-card-title>
          <iv-card-description>v1.0 ships when every gate is green.</iv-card-description>
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
          <iv-card-title>Invite a teammate</iv-card-title>
          <iv-card-description>They get access to this project only.</iv-card-description>
        </iv-card-header>
        <!-- flex-1: the grid stretches both cards, so the footers line up at the bottom. -->
        <iv-card-content class="flex flex-1 flex-col gap-4">
          <iv-field>
            <label ivLabel for="home-email">Email</label>
            <input ivInput id="home-email" type="email" autocomplete="email" placeholder="ada@example.com" />
          </iv-field>
          <label class="flex items-center justify-between gap-4 text-sm">
            <span class="flex flex-col gap-0.5">
              Can edit components
              <span class="text-muted-foreground text-xs">Off: they can only view.</span>
            </span>
            <iv-switch [checked]="true" />
          </label>
        </iv-card-content>
        <iv-card-footer class="justify-end">
          <button ivButton size="sm" class="w-full sm:w-auto">Send invite</button>
        </iv-card-footer>
      </iv-card>
    </section>

    <section aria-labelledby="components-title">
      <div class="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="components-title" class="text-foreground text-xl font-semibold tracking-tight">Components</h2>
        <span class="text-muted-foreground text-sm">{{ components.length }} components</span>
      </div>
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (page of components; track page.slug) {
          <li>
            <a
              [routerLink]="['/docs', page.slug]"
              class="hover:bg-muted/50 focus-visible:ring-ring flex h-full flex-col gap-1 rounded-lg border p-4 transition-colors outline-none focus-visible:ring-2"
            >
              <span class="text-foreground text-sm font-medium">{{ page.title }}</span>
              <span class="text-muted-foreground text-sm">{{ page.description }}</span>
            </a>
          </li>
        }
      </ul>
    </section>
  `,
})
export default class HomePage {
  protected readonly components = PAGES.filter((p) => p.section === 'component');
  protected readonly gates = [
    { label: 'Unit tests', new: false },
    { label: 'SSR smoke', new: true },
    { label: 'Package smoke', new: true },
    { label: 'CI', new: false },
  ];
  protected readonly done = signal(2);

  protected toggle(i: number, on: boolean): void {
    this.done.set(on ? i + 1 : i);
  }
}
