import { ChangeDetectionStrategy, Component, computed, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvSkeleton } from '@inlaylab/ivorie/skeleton';
import type { BlockEntry } from '../content/types';
import { PREVIEW_WIDTHS, PreviewFrame, type PreviewWidth } from '../preview/preview-frame';
import { CopyButton } from '../ui/copy-button';
import { BlockCode } from './block-code';

type View = 'preview' | 'code';

/** One block on /blocks: a toolbar, then the live block (loaded when it scrolls near) or its files. */
@Component({
  selector: 'docs-block-showcase',
  imports: [RouterLink, IvButton, IvSkeleton, PreviewFrame, CopyButton, BlockCode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-3' },
  template: `
    @let b = entry();
    <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <div class="mr-auto min-w-0">
        <h2 class="text-foreground text-lg font-semibold tracking-tight" [id]="b.name + '-title'">
          <a [routerLink]="['/blocks', b.name]" class="hover:underline underline-offset-4">{{ b.title }}</a>
        </h2>
        <p class="text-muted-foreground text-sm text-pretty">{{ b.description }}</p>
      </div>
      <div class="docs-pane flex flex-wrap items-center gap-1 rounded-full p-1">
        <div role="radiogroup" aria-label="View" class="flex gap-0.5">
          @for (v of views; track v.value) {
            <label [class]="pill">
              <input type="radio" class="sr-only" [name]="b.name + '-view'" [value]="v.value" [checked]="view() === v.value" (change)="view.set(v.value)" />
              {{ v.label }}
            </label>
          }
        </div>
        @if (view() === 'preview') {
          <span class="bg-border mx-1 hidden h-5 w-px md:block" aria-hidden="true"></span>
          <div role="radiogroup" aria-label="Preview width" class="hidden gap-0.5 md:flex">
            @for (w of widths; track w.value) {
              <label [class]="pill">
                <input type="radio" class="sr-only" [name]="b.name + '-width'" [value]="w.value" [checked]="width() === w.value" (change)="width.set(w.value)" />
                {{ w.label }}
              </label>
            }
          </div>
          <a ivButton variant="ghost" size="icon-sm" class="rounded-full" [href]="openHref()" target="_blank" rel="noopener" [attr.aria-label]="'Open ' + b.title + ' in a new tab'" data-testid="open">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
          <button ivButton type="button" variant="ghost" size="icon-sm" class="rounded-full" [attr.aria-label]="'Reload ' + b.title" (click)="frame()?.reload()" data-testid="reload">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
            </svg>
          </button>
        }
        <span class="bg-border mx-1 h-5 w-px" aria-hidden="true"></span>
        <span class="text-muted-foreground hidden pl-2 font-mono text-xs sm:inline" data-testid="command">{{ command() }}</span>
        <docs-copy-button [text]="command()" [label]="'Copy ' + command()" />
      </div>
    </div>

    @if (view() === 'preview') {
      <div class="docs-pane rounded-[1.25rem] p-1.5">
        @defer (on viewport) {
          <docs-preview-frame class="h-[42rem]" [path]="'preview/block/' + b.name" [code]="code()" [width]="width()" [label]="b.title + ' preview'" />
        } @placeholder {
          <iv-skeleton class="h-[42rem] w-full rounded-xl" />
        }
      </div>
    } @else {
      <docs-block-code [entry]="b" maxHeight="42rem" />
    }
  `,
})
export class BlockShowcase {
  readonly entry = input.required<BlockEntry>();
  /** The preset share code the preview shows. */
  readonly code = input.required<string>();

  protected readonly frame = viewChild(PreviewFrame);
  protected readonly views: { value: View; label: string }[] = [
    { value: 'preview', label: 'Preview' },
    { value: 'code', label: 'Code' },
  ];
  protected readonly view = signal<View>('preview');
  protected readonly widths = PREVIEW_WIDTHS;
  protected readonly width = signal<PreviewWidth>('desktop');
  protected readonly command = computed(() => `npx ivorie add ${this.entry().name}`);
  protected readonly openHref = computed(() => `preview/block/${this.entry().name}?preset=${this.code()}`);
  protected readonly pill =
    'has-checked:bg-foreground has-checked:text-background text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors duration-(--docs-dur) has-focus-visible:outline-2';
}
