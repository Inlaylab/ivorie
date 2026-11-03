import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IvBadge } from '@inlaylab/ivorie/badge';
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';

/** `/blocks`: coming soon. Skeleton outlines of the first blocks, no fake screenshots. */
@Component({
  selector: 'docs-blocks',
  imports: [RouterLink, IvBadge, IvSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header class="max-w-2xl">
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-foreground text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-semibold tracking-[-0.04em]">Blocks</h1>
          <iv-badge variant="outline">Coming soon</iv-badge>
        </div>
        <p class="text-muted-foreground mt-4 text-lg text-pretty">
          Ready-made page sections built from Ivorie components. Add one with a single command. The code lands in your app, and you change it however you like.
        </p>
      </header>

      <figure class="docs-gradient-border mt-12 overflow-hidden rounded-[1.75rem]">
        <!-- Outlines, not loading state: no pulse. -->
        <div class="docs-stage bg-background grid gap-4 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr] [&_[data-slot=skeleton]]:animate-none" aria-hidden="true">
          <!-- Sign in -->
          <div class="bg-card flex flex-col gap-4 rounded-2xl border p-6">
            <iv-skeleton class="h-5 w-28" />
            <iv-skeleton class="h-3 w-44" />
            <div class="mt-2 flex flex-col gap-2"><iv-skeleton class="h-3 w-12" /><iv-skeleton class="h-9 w-full" /></div>
            <div class="flex flex-col gap-2"><iv-skeleton class="h-3 w-16" /><iv-skeleton class="h-9 w-full" /></div>
            <iv-skeleton class="bg-foreground/15 mt-2 h-9 w-full" />
            <iv-skeleton class="mx-auto h-3 w-36" />
          </div>
          <!-- Sign up -->
          <div class="bg-card flex flex-col gap-4 rounded-2xl border p-6">
            <iv-skeleton class="h-5 w-32" />
            <div class="grid grid-cols-2 gap-2"><iv-skeleton class="h-9" /><iv-skeleton class="h-9" /></div>
            <iv-skeleton class="h-9 w-full" />
            <iv-skeleton class="h-9 w-full" />
            <div class="flex items-center gap-2"><iv-skeleton class="size-4" /><iv-skeleton class="h-3 w-40" /></div>
            <iv-skeleton class="bg-foreground/15 mt-auto h-9 w-full" />
          </div>
          <!-- Sidebar layout -->
          <div class="bg-card flex min-h-64 overflow-hidden rounded-2xl border md:col-span-2 lg:col-span-1">
            <div class="bg-muted/40 flex w-2/5 flex-col gap-3 border-r p-4">
              <iv-skeleton class="h-6 w-24" />
              @for (w of nav; track $index) {
                <iv-skeleton class="h-3" [style.width.%]="w" />
              }
            </div>
            <div class="flex flex-1 flex-col gap-3 p-4">
              <iv-skeleton class="h-4 w-1/2" />
              <div class="grid grid-cols-3 gap-2"><iv-skeleton class="h-14" /><iv-skeleton class="h-14" /><iv-skeleton class="h-14" /></div>
              <iv-skeleton class="w-full flex-1" />
            </div>
          </div>
        </div>
        <figcaption class="bg-card flex flex-col gap-4 border-t p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div class="flex flex-col gap-1">
            <span class="text-foreground font-medium">First up: sign in, sign up and sidebar layouts</span>
            <span class="text-muted-foreground text-sm">Each one works in every style and color you pick in the playground.</span>
          </div>
          <code class="bg-muted/60 text-muted-foreground self-start rounded-full border px-4 py-1.5 font-mono text-[0.8125rem] sm:self-auto">npx ivorie add login-01</code>
        </figcaption>
      </figure>

      <p class="text-muted-foreground mt-8 text-sm">
        Blocks ship in the next release.
        <a routerLink="/roadmap" class="text-foreground font-medium underline-offset-4 hover:underline">See the roadmap</a>
        for what comes after.
      </p>
    </div>
  `,
})
export default class BlocksPage {
  protected readonly nav = [70, 55, 80, 60, 45, 65];

  constructor() {
    inject(Meta).updateTag({ name: 'description', content: 'Ready-made page sections for Ivorie. Coming soon.' });
  }
}
