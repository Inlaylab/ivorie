import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ActivatedRoute, Router } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { CopyButton } from '../ui/copy-button';
import { LookControls } from './look-controls';
import { PlaygroundLook } from './playground-look';
import { PlaygroundPreview } from './playground-preview';
import { DEFAULT_PRESET, encodePreset } from './preset-code';

const DEFAULT_CODE = encodePreset(DEFAULT_PRESET);
type Target = 'new' | 'existing';

@Component({
  selector: 'docs-playground',
  imports: [NgTemplateOutlet, IvButton, IV_DIALOG_IMPORTS, IV_SHEET_IMPORTS, CopyButton, LookControls, PlaygroundPreview],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block lg:grid lg:grid-cols-[20rem_minmax(0,1fr)]' },
  template: `
    <!-- The rail: controls scroll, the install block and Reset stay at the bottom. -->
    <aside
      aria-labelledby="pg-title"
      class="lg:bg-background flex flex-col lg:sticky lg:top-(--header-height) lg:h-[calc(100svh-var(--header-height))] lg:border-r"
    >
      <div class="flex flex-col gap-1.5 px-4 pt-6 pb-4 sm:px-6 lg:pt-8">
        <h1 id="pg-title" class="text-foreground text-2xl font-semibold tracking-[-0.03em]">Playground</h1>
        <p class="text-muted-foreground text-sm text-pretty">Pick a look. The preview is real components; the command installs the same look.</p>
      </div>
      <div class="hidden flex-1 overflow-y-auto px-6 pt-2 pb-6 lg:block">
        <docs-look-controls [look]="look" name="rail" />
      </div>
      <div class="bg-muted/30 hidden border-t lg:block">
        <ng-container [ngTemplateOutlet]="install" [ngTemplateOutletContext]="{ $implicit: 'rail' }" />
      </div>
    </aside>

    <!-- The stage: a dotted canvas in the chosen look. Nothing outside it changes. -->
    <section aria-label="Preview" class="min-w-0 pb-24 lg:pb-0">
      <div #stage class="docs-stage bg-background min-h-full p-4 sm:p-6 lg:p-8">
        <docs-playground-preview />
      </div>
    </section>

    <!-- Small screens: the controls open in a sheet; the command stays one tap away. -->
    <div class="bg-background/85 supports-[backdrop-filter]:bg-background/70 fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t p-3 backdrop-blur-md lg:hidden">
      <button ivButton class="flex-1" [ivSheetTrigger]="sheet" [ivSheetConfig]="{ side: 'bottom' }">Customize</button>
      <docs-copy-button [text]="command()" label="Copy command" />
    </div>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Customize</iv-sheet-title>
        <iv-sheet-description>The preview changes behind this panel.</iv-sheet-description>
      </iv-sheet-header>
      <div class="flex max-h-[60svh] flex-col overflow-y-auto">
        <docs-look-controls class="px-4 pb-6" [look]="look" name="sheet" />
        <div class="border-t"><ng-container [ngTemplateOutlet]="install" [ngTemplateOutletContext]="{ $implicit: 'sheet' }" /></div>
      </div>
    </ng-template>

    <ng-template #install let-at>
      <div class="flex flex-col gap-3 px-4 py-4 sm:px-6">
        <div class="flex items-center justify-between gap-2">
          <span class="text-foreground text-sm font-medium">Install</span>
          <div role="radiogroup" aria-label="Install into" class="bg-muted flex gap-0.5 rounded-full p-0.5">
            @for (t of targets; track t.value) {
              <label class="has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs text-muted-foreground has-focus-visible:outline-ring cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors has-focus-visible:outline-2">
                <input type="radio" class="sr-only" [name]="at + '-target'" [value]="t.value" [checked]="target() === t.value" (change)="target.set(t.value)" />
                {{ t.label }}
              </label>
            }
          </div>
        </div>
        <div class="bg-background flex items-center gap-2 rounded-xl border py-0.5 pr-0.5 pl-3 font-mono text-xs">
          <span class="min-w-0 flex-1 truncate" data-testid="command" [title]="command()">{{ command() }}</span>
          <docs-copy-button [text]="command()" label="Copy command" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button ivButton variant="outline" size="sm" [ivDialogTrigger]="cssDialog">View CSS</button>
          <button ivButton variant="outline" size="sm" (click)="copyCode()">{{ codeCopied() ? 'Copied' : 'Copy preset code' }}</button>
        </div>
        <button ivButton variant="ghost" size="sm" class="text-muted-foreground mt-1 w-full" [disabled]="isDefault()" (click)="reset()">Reset to default</button>
      </div>
    </ng-template>

    <ng-template #cssDialog>
      <iv-dialog-header>
        <iv-dialog-title>theme.css variables</iv-dialog-title>
        <iv-dialog-description>The command writes this for you. Paste it to change the look by hand.</iv-dialog-description>
      </iv-dialog-header>
      <div class="relative min-w-0">
        <pre class="bg-muted/60 max-h-[50svh] overflow-auto rounded-lg border p-3 font-mono text-xs leading-relaxed"><code>{{ look.css() }}</code></pre>
        <docs-copy-button class="absolute top-2 right-2" [text]="look.css()" label="Copy CSS" />
      </div>
    </ng-template>
  `,
})
export default class PlaygroundPage {
  protected readonly look = inject(PlaygroundLook);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  /** False until the URL preset is read in the browser, so the server markup and the first client render match. */
  private readonly ready = signal(false);

  protected readonly targets: { value: Target; label: string }[] = [
    { value: 'new', label: 'New app' },
    { value: 'existing', label: 'Existing app' },
  ];
  protected readonly target = signal<Target>('new');
  protected readonly codeCopied = signal(false);
  protected readonly isDefault = computed(() => this.look.code() === DEFAULT_CODE);
  protected readonly command = computed(() => {
    const code = this.isDefault() ? null : this.look.code();
    if (this.target() === 'existing') return `npx ivorie apply ${code ?? 'default'}`;
    return code ? `npx ivorie init --preset ${code}` : 'npx ivorie init';
  });

  constructor() {
    const overlays = inject(OverlayContainer);
    afterNextRender(() => {
      // The look shows on the stage and on what it opens (dialogs, menus), not on the site.
      this.look.attach(this.stage().nativeElement);
      this.look.attach(overlays.getContainerElement());
      this.look.load(this.route.snapshot.queryParamMap.get('preset'));
      this.ready.set(true);
    });
    // The look lives in the URL, so a link shares it. The default look has no query.
    effect(() => {
      const preset = this.isDefault() ? null : this.look.code();
      if (!this.ready()) return;
      void this.router.navigate([], { relativeTo: this.route, queryParams: { preset }, replaceUrl: true });
    });
  }

  protected reset(): void {
    this.look.load(null);
  }

  protected async copyCode(): Promise<void> {
    try {
      await this.doc.defaultView?.navigator.clipboard.writeText(this.look.code());
      this.codeCopied.set(true);
      setTimeout(() => this.codeCopied.set(false), 1500);
    } catch {
      // Clipboard blocked: the code is also in the URL and the command.
    }
  }
}
