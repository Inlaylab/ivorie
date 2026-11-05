import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';
import { BLOCKS } from '../../generated/blocks';
import { DEFAULT_PRESET, encodePreset } from '../playground/preset-code';

const GROUPS = ['Login', 'Sign up', 'Sidebar', 'Dashboard'] as const;

/** `/blocks`: every block, grouped, each with a live thumbnail of the real block. */
@Component({
  selector: 'docs-blocks',
  imports: [RouterLink, IvSkeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-6xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header class="max-w-2xl">
        <h1 class="text-foreground text-[clamp(2.25rem,5vw,3.25rem)] leading-none font-semibold tracking-[-0.04em]">Blocks</h1>
        <p class="text-muted-foreground mt-4 text-lg text-pretty">
          Whole pages built from Ivorie components: sign in, sign up, app shells and a dashboard. Forms validate, buttons emit, the sidebar
          follows your routes. Add one with a single command, then make it yours.
        </p>
        <code class="bg-muted/60 text-muted-foreground mt-6 inline-block rounded-full border px-4 py-1.5 font-mono text-[0.8125rem]">npx ivorie add login-01</code>
      </header>

      @for (g of groups; track g.label) {
        <section class="mt-16" [attr.aria-labelledby]="'group-' + $index">
          <h2 [id]="'group-' + $index" class="text-foreground text-xl font-semibold tracking-tight">{{ g.label }}</h2>
          <ul class="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (b of g.blocks; track b.name) {
              <li>
                <a [routerLink]="['/blocks', b.name]" class="group focus-visible:ring-ring flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-4">
                  <!-- The real block, shrunk to a quarter: it is a picture here, so it takes no focus or clicks. -->
                  <span class="bg-muted/40 relative block aspect-[16/10] overflow-hidden rounded-2xl border transition-shadow group-hover:shadow-md">
                    @defer (on viewport) {
                      <iframe
                        class="pointer-events-none absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25"
                        [src]="b.src"
                        [title]="b.title + ' thumbnail'"
                        tabindex="-1"
                        aria-hidden="true"
                        inert
                        loading="lazy"
                      ></iframe>
                    } @placeholder {
                      <iv-skeleton class="absolute inset-0 rounded-none" />
                    }
                  </span>
                  <span class="flex flex-col gap-0.5 px-1">
                    <span class="text-foreground font-medium">{{ b.title }}</span>
                    <span class="text-muted-foreground text-sm text-pretty">{{ b.description }}</span>
                  </span>
                </a>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export default class BlocksPage {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly code = encodePreset(DEFAULT_PRESET);
  // Same-origin paths built here from the generated block list, never from input.
  protected readonly groups = GROUPS.map((label) => ({
    label,
    blocks: BLOCKS.filter((b) => b.group === label).map((b) => ({
      ...b,
      src: this.sanitizer.bypassSecurityTrustResourceUrl(`preview/block/${b.name}?preset=${this.code}`),
    })),
  }));

  constructor() {
    inject(Meta).updateTag({ name: 'description', content: 'Ready-made login, sign-up, sidebar and dashboard pages for Ivorie.' });
  }
}
