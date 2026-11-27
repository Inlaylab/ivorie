import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COFFEE_URL } from './site-header';

/** A footer link: a route inside the site, or a page elsewhere (opens in a new tab). */
interface FooterLink {
  label: string;
  route?: string;
  href?: string;
}

/** The footer on every page: credits and the license, then the site links in four columns. */
@Component({
  selector: 'docs-site-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="docs-rail">
      <div class="docs-sec text-muted-foreground grid gap-10 px-6 py-12 text-sm sm:px-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <p class="flex items-start gap-2 text-pretty">
          <span class="mt-2 size-1.5 shrink-0 rounded-full bg-(--brand)" aria-hidden="true"></span>
          <!-- Credit the work this stands on, the way shadcn/ui ports do. -->
          <span
            >By
            <a href="https://github.com/Inlaylab" target="_blank" rel="noreferrer" class="text-foreground font-medium underline underline-offset-4 hover:no-underline">Inlaylab</a>.
            Built on
            <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer" class="text-foreground underline underline-offset-4 hover:no-underline">shadcn/ui</a>
            and
            <a href="https://www.radix-ui.com/primitives" target="_blank" rel="noreferrer" class="text-foreground underline underline-offset-4 hover:no-underline">Radix UI</a>
            patterns. MIT license.</span
          >
        </p>
        <nav aria-label="Footer" class="grid grid-cols-2 gap-8 sm:grid-cols-4">
          @for (col of columns; track col.title) {
            <div class="flex flex-col gap-2">
              <h2 class="docs-eyebrow">{{ col.title }}</h2>
              <ul>
                @for (l of col.links; track l.label) {
                  <li>
                    @if (l.route) {
                      <a [routerLink]="l.route" class="hover:text-foreground inline-flex min-h-11 items-center">{{ l.label }}</a>
                    } @else {
                      <a [href]="l.href" target="_blank" rel="noreferrer" class="hover:text-foreground inline-flex min-h-11 items-center">{{ l.label }}</a>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </nav>
      </div>
    </div>
  `,
})
export class SiteFooter {
  protected readonly columns: { title: string; links: FooterLink[] }[] = [
    { title: 'Docs', links: [{ label: 'Installation', route: '/docs/installation' }, { label: 'CLI', route: '/docs/cli' }] },
    {
      title: 'Library',
      links: [{ label: 'Components', route: '/docs/components' }, { label: 'Blocks', route: '/blocks' }, { label: 'Playground', route: '/playground' }],
    },
    { title: 'Project', links: [{ label: 'Changelog', route: '/changelog' }, { label: 'Source on GitHub', href: 'https://github.com/Inlaylab/ivorie' }] },
    { title: 'Support', links: [{ label: 'Buy me a coffee', href: COFFEE_URL }] },
  ];
}
