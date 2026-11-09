import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { PREVIEW_WIDTHS, PreviewFrame, type PreviewWidth } from '../preview/preview-frame';
import { CopyButton } from '../ui/copy-button';
import { LookControls } from './look-controls';
import { PREVIEW_ICONS, PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { STYLES } from '../shell/appearance-options';

const DEFAULT_CODE = encodePreset(DEFAULT_PRESET);
type Target = 'new' | 'existing';

@Component({
  selector: 'docs-playground',
  imports: [
    NgTemplateOutlet,
    IvButton,
    IV_DIALOG_IMPORTS,
    IV_SELECT_IMPORTS,
    IV_SHEET_IMPORTS,
    CopyButton,
    LookControls,
    PreviewFrame,
  ],
  providers: [PlaygroundLook, PREVIEW_ICONS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block gap-4 p-3 pb-20 sm:p-4 sm:pb-20 lg:grid lg:pb-4 lg:h-[calc(100svh-var(--header-height))] lg:grid-cols-[18rem_minmax(0,1fr)]' },
  template: `
    <!-- The panel: a floating card. Rows on top, the command and actions at the bottom. -->
    <aside aria-labelledby="pg-title" class="docs-pane hidden min-h-0 flex-col overflow-hidden rounded-2xl lg:flex">
      <div class="flex items-center justify-between border-b py-2 pr-2 pl-4">
        <h1 id="pg-title" class="text-foreground text-sm font-semibold">Customize</h1>
        <button ivButton variant="ghost" size="icon-sm" aria-label="Reset to default" [disabled]="isDefault()" (click)="reset()" data-testid="reset">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto p-1.5">
        <docs-look-controls [look]="look" name="rail" />
        <div class="docs-panel mt-0.5 hidden md:block">
          <hr class="mb-2 mt-1" />
          <ng-container [ngTemplateOutlet]="widthRow" />
        </div>
      </div>
      <div class="flex flex-col gap-2 border-t p-2">
        <div class="bg-background/50 flex items-center gap-1 rounded-lg border py-0.5 pr-0.5 pl-2.5 font-mono text-xs">
          <span class="min-w-0 flex-1 truncate" data-testid="panel-command" [title]="command()">{{ command() }}</span>
          <docs-copy-button [text]="command()" label="Copy command" />
        </div>
        <button ivButton variant="outline" class="w-full" (click)="shuffle()">
          <ng-container [ngTemplateOutlet]="shuffleIcon" />
          Shuffle
        </button>
        <button ivButton class="w-full" [ivDialogTrigger]="codeDialog">Get code</button>
      </div>
    </aside>

    <!-- The stage: the wall in an iframe, in the picked look, on a big canvas. Nothing of the site leaks into it. -->
    <section aria-label="Preview" class="docs-pane docs-stage flex min-h-[80svh] min-w-0 flex-col overflow-hidden rounded-3xl p-2 sm:p-3 lg:min-h-0">
      <docs-preview-frame class="min-h-0 flex-1" path="preview/scene/wall" [code]="look.code()" [width]="width()" label="Preview" />
    </section>

    <!-- Small screens: the controls open in a sheet; the actions stay in a bar. -->
    <div class="docs-pane docs-pane-blur fixed inset-x-3 bottom-3 z-20 flex items-center gap-1 rounded-full p-1 lg:hidden">
      <button ivButton variant="ghost" class="rounded-full" [ivSheetTrigger]="sheet" [ivSheetConfig]="{ side: 'bottom' }">Customize</button>
      <span class="flex-1"></span>
      <ng-container [ngTemplateOutlet]="actions" />
    </div>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Customize</iv-sheet-title>
        <iv-sheet-description>The preview changes behind this panel.</iv-sheet-description>
      </iv-sheet-header>
      <div class="flex max-h-[60svh] flex-col overflow-y-auto px-2 pb-6">
        <docs-look-controls [look]="look" name="sheet" />
      </div>
    </ng-template>

    <ng-template #widthRow>
      <div class="docs-panel-row">
        <span class="docs-row-label" id="pg-width-label">Preview width</span>
        <iv-select [value]="width()" (valueChange)="width.set($any($event) ?? 'desktop')">
          <iv-select-trigger aria-labelledby="pg-width-label" />
          <iv-select-content>
            @for (w of widths; track w.value) {
              <iv-select-item [value]="w.value">{{ w.label }}</iv-select-item>
            }
          </iv-select-content>
        </iv-select>
      </div>
    </ng-template>

    <ng-template #shuffleIcon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m18 14 4 4-4 4" /><path d="m18 2 4 4-4 4" /><path d="M2 18h1.97a4 4 0 0 0 3.3-1.7l5.45-8.6a4 4 0 0 1 3.3-1.7H22" /><path d="M2 6h1.97a4 4 0 0 1 3.3 1.7l.4.63" /><path d="M22 18h-6.04a4 4 0 0 1-3.3-1.8l-.36-.45" />
      </svg>
    </ng-template>

    <ng-template #actions>
      <button ivButton variant="ghost" class="rounded-full" (click)="copyLink()" aria-label="Copy link" data-testid="copy-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <button ivButton variant="ghost" class="rounded-full" (click)="shuffle()" aria-label="Shuffle the look" data-testid="shuffle">
        <ng-container [ngTemplateOutlet]="shuffleIcon" />
      </button>
      <button ivButton class="rounded-full px-5" [ivDialogTrigger]="codeDialog" data-testid="get-code">Get code</button>
      <span class="sr-only" aria-live="polite">{{ linkCopied() ? 'Link copied' : '' }}</span>
    </ng-template>

    <ng-template #codeDialog>
      <iv-dialog-header>
        <iv-dialog-title>Get the code</iv-dialog-title>
        <iv-dialog-description>{{
          target() === 'new'
            ? 'Run it in your Angular app. It sets up Tailwind, the theme and this look.'
            : 'Run it in an app that has Ivorie. It rewrites the theme and the style.'
        }}</iv-dialog-description>
      </iv-dialog-header>
      <div class="flex min-w-0 flex-col gap-4">
        <div role="radiogroup" aria-label="Install into" class="bg-muted flex gap-0.5 self-start rounded-full p-0.5">
          @for (t of targets; track t.value) {
            <label [class]="pillMuted + ' px-3 py-1 text-sm whitespace-nowrap'">
              <input type="radio" class="sr-only" name="code-target" [value]="t.value" [checked]="target() === t.value" (change)="target.set(t.value)" />
              {{ t.label }}
            </label>
          }
        </div>
        <div class="bg-muted/50 flex items-center gap-2 rounded-xl border py-0.5 pr-0.5 pl-3 font-mono text-xs">
          <span class="min-w-0 flex-1 truncate" data-testid="command" [title]="command()">{{ command() }}</span>
          <docs-copy-button [text]="command()" label="Copy command" />
        </div>
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Preset code</span>
          <div class="bg-muted/50 flex items-center gap-2 rounded-xl border py-0.5 pr-0.5 pl-3 font-mono text-xs">
            <span class="min-w-0 flex-1 truncate" data-testid="preset-code">{{ look.code() }}</span>
            <docs-copy-button [text]="look.code()" label="Copy preset code" />
          </div>
        </div>
        <div class="flex min-w-0 flex-col gap-1.5">
          <span class="text-sm font-medium">theme.css variables</span>
          <div class="relative min-w-0">
            <pre class="bg-muted/50 max-h-[40svh] overflow-auto rounded-xl border p-3 font-mono text-xs leading-relaxed"><code>{{ look.css() }}</code></pre>
            <docs-copy-button class="absolute top-2 right-2" [text]="look.css()" label="Copy CSS" />
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export default class PlaygroundPage {
  protected readonly look = inject(PlaygroundLook);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  /** False until the URL preset is read in the browser, so the server markup and the first client render match. */
  private readonly ready = signal(false);

  protected readonly targets: { value: Target; label: string }[] = [
    { value: 'new', label: 'New app' },
    { value: 'existing', label: 'Existing app' },
  ];
  protected readonly target = signal<Target>('new');
  protected readonly widths = PREVIEW_WIDTHS;
  protected readonly width = signal<PreviewWidth>('desktop');
  /** The same inside a dialog, on a muted track. */
  protected readonly pillMuted =
    'has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full font-medium transition-colors has-focus-visible:outline-2';
  protected readonly linkCopied = signal(false);
  protected readonly isDefault = computed(() => this.look.code() === DEFAULT_CODE);
  protected readonly command = computed(() => {
    const code = this.isDefault() ? null : this.look.code();
    if (this.target() === 'existing') return `npx ivorie apply ${code ?? 'default'}`;
    return code ? `npx ivorie init --preset ${code}` : 'npx ivorie init';
  });

  constructor() {
    afterNextRender(() => {
      const query = this.route.snapshot.queryParamMap;
      this.look.load(query.get('preset'));
      this.ready.set(true);
    });
    // The look lives in the URL, so a link shares it. The default look has no query.
    effect(() => {
      const preset = this.isDefault() ? null : this.look.code();
      if (!this.ready()) return;
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { preset },
        replaceUrl: true,
      });
    });
  }

  protected reset(): void {
    this.look.load(null);
  }

  /** The URL already holds the preset. */
  protected async copyLink(): Promise<void> {
    try {
      const win = this.doc.defaultView!;
      await win.navigator.clipboard.writeText(win.location.href);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 1500);
    } catch {
      // Clipboard blocked: the link is in the address bar.
    }
  }

  /** A random style, base color, radius and fonts. The icon set stays. Never the look already showing. */
  shuffle(random: () => number = Math.random): void {
    const any = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];
    const fonts = FONTS.map((f) => f.name);
    const before = this.look.code();
    for (let i = 0; i < 10 && this.look.code() === before; i++) {
      this.look.set({
        style: any(STYLES).name,
        baseColor: any(BASE_COLORS).name,
        radius: any(Object.keys(RADII)),
        font: any(['system', ...fonts]),
        // Half the time the headings keep the body font.
        fontHeading: random() < 0.5 ? 'inherit' : any(fonts),
      });
    }
  }
}
