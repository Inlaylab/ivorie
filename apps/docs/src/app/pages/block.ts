import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';
import { map } from 'rxjs';
import { BLOCKS } from '../../generated/blocks';
import { LookControls } from '../playground/look-controls';
import { PREVIEW_ICONS, PlaygroundLook } from '../playground/playground-look';
import { PREVIEW_WIDTHS, PreviewFrame, type PreviewWidth } from '../preview/preview-frame';
import { CopyButton } from '../ui/copy-button';
import { TrustedHtmlPipe } from '../ui/trusted-html.pipe';

/** What the login and sign-up blocks take and give. */
const AUTH_API = [
  { name: 'pending', kind: 'input', type: 'boolean', text: 'Disables the form while your request runs.' },
  { name: 'error', kind: 'input', type: 'string | null', text: 'Shown in an alert above the fields.' },
  { name: 'submitted', kind: 'output', type: 'LoginValue | SignupValue', text: 'The valid form value. Only valid forms submit.' },
  { name: 'provider', kind: 'output', type: "'google' | 'github' | 'apple'", text: 'The social button that was clicked.' },
];

/** `/blocks/:name`: the block live in a frame, in the look you pick, its files and the install command. */
@Component({
  selector: 'docs-block',
  imports: [RouterLink, IV_TABS_IMPORTS, LookControls, PreviewFrame, CopyButton, TrustedHtmlPipe],
  providers: [PlaygroundLook, PREVIEW_ICONS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6">
      <a routerLink="/blocks" class="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">All blocks</a>
      @if (entry(); as b) {
        <header class="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-2xl">
            <h1 class="text-foreground text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{{ b.title }}</h1>
            <p class="text-muted-foreground mt-2 text-pretty">{{ b.description }}</p>
          </div>
          <div class="bg-background flex min-w-0 items-center gap-3 rounded-full border py-1 pr-1 pl-5 font-mono text-[0.8125rem]">
            <span class="truncate"><span class="text-muted-foreground select-none">$ </span><span data-testid="command">{{ command() }}</span></span>
            <docs-copy-button [text]="command()" [label]="'Copy ' + command()" />
          </div>
        </header>

        <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <iv-tabs defaultValue="preview" class="min-w-0">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <iv-tabs-list aria-label="View">
                <iv-tabs-trigger value="preview">Preview</iv-tabs-trigger>
                <iv-tabs-trigger value="code">Code</iv-tabs-trigger>
              </iv-tabs-list>
              <div role="radiogroup" aria-label="Preview width" class="bg-muted hidden gap-0.5 rounded-full p-0.5 md:flex">
                @for (w of widths; track w.value) {
                  <label
                    class="has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors has-focus-visible:outline-2"
                  >
                    <input type="radio" class="sr-only" name="block-width" [value]="w.value" [checked]="width() === w.value" (change)="width.set(w.value)" />
                    {{ w.label }}
                  </label>
                }
              </div>
            </div>
            <iv-tabs-content value="preview" class="mt-3">
              <div class="docs-stage bg-muted/40 rounded-2xl border p-2 sm:p-3">
                <docs-preview-frame class="h-[46rem]" [path]="'preview/block/' + b.name" [code]="look.code()" [width]="width()" [label]="b.title + ' preview'" />
              </div>
            </iv-tabs-content>
            <iv-tabs-content value="code" class="mt-3">
              @if (files.value(); as list) {
                <div class="grid overflow-hidden rounded-2xl border md:grid-cols-[14rem_minmax(0,1fr)]">
                  <nav aria-label="Files" class="bg-muted/40 flex flex-col gap-0.5 border-b p-2 md:border-r md:border-b-0">
                    @for (f of list; track f.path) {
                      <button
                        type="button"
                        data-testid="file"
                        class="hover:bg-background aria-[current=true]:bg-background aria-[current=true]:text-foreground text-muted-foreground truncate rounded-md px-2.5 py-1.5 text-left font-mono text-xs"
                        [attr.aria-current]="f.path === file()?.path"
                        (click)="current.set(f.path)"
                      >
                        {{ f.path }}
                      </button>
                    }
                  </nav>
                  @if (file(); as f) {
                    <div class="relative min-w-0">
                      <docs-copy-button class="absolute top-2 right-2 z-10" [text]="f.code" [label]="'Copy ' + f.path" />
                      <div class="max-h-[46rem] overflow-auto text-[0.8125rem] [&_pre]:p-4" [innerHTML]="f.html | trustedHtml"></div>
                    </div>
                  }
                </div>
              }
            </iv-tabs-content>
          </iv-tabs>

          <aside aria-label="Look" class="flex flex-col gap-6">
            <docs-look-controls compact [look]="look" name="block" class="gap-5" />
            @if (auth()) {
              <section data-testid="api" class="flex flex-col gap-2 border-t pt-5" aria-labelledby="block-api">
                <h2 id="block-api" class="text-foreground text-sm font-medium">Inputs and outputs</h2>
                <dl class="flex flex-col gap-3 text-sm">
                  @for (a of api; track a.name) {
                    <div>
                      <dt class="font-mono text-xs">
                        <span class="text-foreground">{{ a.name }}</span>
                        <span class="text-muted-foreground"> {{ a.kind }} · {{ a.type }}</span>
                      </dt>
                      <dd class="text-muted-foreground mt-0.5 text-pretty">{{ a.text }}</dd>
                    </div>
                  }
                </dl>
              </section>
            }
          </aside>
        </div>
      } @else {
        <p class="text-muted-foreground mt-6">Unknown block.</p>
      }
    </div>
  `,
})
export default class BlockPage {
  protected readonly look = inject(PlaygroundLook);
  private readonly name = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('name'))));
  protected readonly entry = computed(() => BLOCKS.find((b) => b.name === this.name()));
  protected readonly command = computed(() => `npx ivorie add ${this.entry()?.name}`);
  protected readonly auth = computed(() => /^(login|signup)-/.test(this.entry()?.name ?? ''));
  protected readonly api = AUTH_API;
  protected readonly widths = PREVIEW_WIDTHS;
  protected readonly width = signal<PreviewWidth>('desktop');
  protected readonly files = resource({ params: () => this.entry(), loader: ({ params }) => params.files() });
  /** The open file: the page file first. */
  protected readonly current = linkedSignal(() => this.entry()?.name + '.ts');
  protected readonly file = computed((): { path: string; code: string; html: string } | undefined => {
    const list = this.files.value() ?? [];
    return list.find((f) => f.path === this.current()) ?? list[0];
  });

  constructor() {
    const meta = inject(Meta);
    effect(() => {
      const b = this.entry();
      if (b) meta.updateTag({ name: 'description', content: b.description });
    });
  }
}
