import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, resource } from '@angular/core';
import type { BlockEntry } from '../content/types';
import { CopyButton } from '../ui/copy-button';
import { TrustedHtmlPipe } from '../ui/trusted-html.pipe';

/** A block's files: a list on the left, the open file on the right. The page file opens first. */
@Component({
  selector: 'docs-block-code',
  imports: [CopyButton, TrustedHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (files.value(); as list) {
      <div class="docs-pane grid overflow-hidden rounded-2xl md:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Files" class="flex flex-col gap-0.5 border-b p-2 md:border-r md:border-b-0">
          @for (f of list; track f.path) {
            <button
              type="button"
              data-testid="file"
              class="hover:bg-foreground/[0.05] aria-[current=true]:bg-foreground/[0.08] aria-[current=true]:text-foreground text-muted-foreground truncate rounded-md px-2.5 py-1.5 text-left font-mono text-xs"
              [attr.aria-current]="f.path === file().path"
              (click)="current.set(f.path)"
            >
              {{ f.path }}
            </button>
          }
        </nav>
        @if (file(); as f) {
          <div class="relative min-w-0">
            <docs-copy-button class="absolute top-2 right-2 z-10" [text]="f.code" [label]="'Copy ' + f.path" />
            <div class="overflow-auto text-[0.8125rem] [&_.shiki]:rounded-none [&_.shiki]:border-0 [&_pre]:p-4" [style.max-height]="maxHeight()" [innerHTML]="f.html | trustedHtml"></div>
          </div>
        }
      </div>
    }
  `,
})
export class BlockCode {
  readonly entry = input.required<BlockEntry>();
  readonly maxHeight = input('46rem');
  protected readonly files = resource({ params: () => this.entry(), loader: ({ params }) => params.files() });
  protected readonly current = linkedSignal(() => this.entry().name + '.ts');
  protected readonly file = computed(() => {
    const list = this.files.value() ?? [];
    return list.find((f) => f.path === this.current()) ?? list[0];
  });
}
