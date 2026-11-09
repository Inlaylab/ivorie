import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { BLOCKS } from '../../generated/blocks';
import { DEFAULT_PRESET, encodePreset } from '../playground/preset-code';
import { BlockShowcase } from './block-showcase';

/** Category tabs. The tab is in the URL (`?category=`); Featured has no query. */
const CATEGORIES = [
  { value: 'featured', label: 'Featured', blocks: ['login-01', 'signup-01', 'sidebar-01', 'dashboard-01'] },
  { value: 'login', label: 'Login', group: 'Login' },
  { value: 'signup', label: 'Sign up', group: 'Sign up' },
  { value: 'sidebar', label: 'Sidebar', group: 'Sidebar' },
  { value: 'dashboard', label: 'Dashboard', group: 'Dashboard' },
] as const;

/** `/blocks`: one category at a time, each block full width with its own toolbar. */
@Component({
  selector: 'docs-blocks',
  imports: [RouterLink, BlockShowcase],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20">
      <header>
        <div class="max-w-2xl">
          <h1 class="font-display text-foreground text-[clamp(2.25rem,5vw,3.5rem)] leading-none font-semibold tracking-[-0.025em]">Blocks</h1>
          <p class="text-muted-foreground mt-4 text-lg text-pretty">
            Whole pages built from Ivorie components: sign in, sign up, app shells and a dashboard. Forms validate, buttons emit, the
            sidebar follows your routes. Add one with a single command, then make it yours.
          </p>
        </div>
      </header>

      <nav aria-label="Block categories" class="docs-pane no-scrollbar mt-10 flex max-w-full gap-0.5 self-start overflow-x-auto rounded-full p-1 sm:w-fit">
        @for (c of categories; track c.value) {
          <a
            routerLink="/blocks"
            [queryParams]="{ category: c.value === 'featured' ? null : c.value }"
            [attr.aria-current]="category().value === c.value ? 'page' : null"
            class="aria-[current=page]:bg-foreground aria-[current=page]:text-background text-muted-foreground hover:text-foreground shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-(--docs-dur)"
            >{{ c.label }}</a
          >
        }
      </nav>

      <div class="mt-10 flex flex-col gap-16">
        @for (b of blocks(); track b.name) {
          <docs-block-showcase [entry]="b" [code]="code" [attr.aria-labelledby]="b.name + '-title'" role="region" />
        }
      </div>
    </div>
  `,
})
export default class BlocksPage {
  protected readonly categories = CATEGORIES;
  protected readonly code = encodePreset(DEFAULT_PRESET);
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap.pipe(map((q) => q.get('category'))));
  protected readonly category = computed(() => CATEGORIES.find((c) => c.value === this.query()) ?? CATEGORIES[0]);
  protected readonly blocks = computed(() => {
    const c = this.category();
    return 'group' in c ? BLOCKS.filter((b) => b.group === c.group) : c.blocks.map((name) => BLOCKS.find((b) => b.name === name)!);
  });

  constructor() {
    inject(Meta).updateTag({ name: 'description', content: 'Ready-made login, sign-up, sidebar and dashboard pages for Ivorie.' });
  }
}
