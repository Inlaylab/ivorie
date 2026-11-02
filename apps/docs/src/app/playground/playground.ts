import { ChangeDetectionStrategy, Component, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_DIALOG_IMPORTS } from '@inlaylab/ivorie/dialog';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IvSeparator } from '@inlaylab/ivorie/separator';
import { IV_SHEET_IMPORTS } from '@inlaylab/ivorie/sheet';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { Appearance, type ColorMode } from '../shell/appearance';
import { STYLES } from '../shell/appearance-options';
import { CopyButton } from '../ui/copy-button';
import { PlaygroundLook } from './playground-look';
import { PlaygroundPreview } from './playground-preview';
import { DEFAULT_PRESET, encodePreset, type Preset } from './preset-code';

const DEFAULT_CODE = encodePreset(DEFAULT_PRESET);
const RADIUS_LABELS: Record<string, string> = { default: 'Default', none: 'None', small: 'Small', medium: 'Medium', large: 'Large' };
const FONT_GROUPS = (['sans', 'serif', 'mono'] as const).map((type) => ({
  label: { sans: 'Sans', serif: 'Serif', mono: 'Mono' }[type],
  fonts: FONTS.filter((f) => f.type === type),
}));

@Component({
  selector: 'docs-playground',
  imports: [
    NgTemplateOutlet,
    IvButton,
    IV_DIALOG_IMPORTS,
    IV_SELECT_IMPORTS,
    IvSeparator,
    IV_SHEET_IMPORTS,
    CopyButton,
    PlaygroundPreview,
  ],
  providers: [PlaygroundLook],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block pb-24 lg:pb-0' },
  template: `
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <aside
        aria-label="Look"
        class="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:w-72 lg:shrink-0"
      >
        <div class="flex flex-col gap-1">
          <h1 class="text-foreground text-2xl font-semibold tracking-tight">Playground</h1>
          <p class="text-muted-foreground text-sm">Pick a look. Copy one command.</p>
        </div>
        <div class="hidden flex-col gap-6 lg:flex">
          <ng-container [ngTemplateOutlet]="controls" [ngTemplateOutletContext]="{ $implicit: 'rail' }" />
          <iv-separator />
          <ng-container [ngTemplateOutlet]="install" />
        </div>
      </aside>
      <docs-playground-preview class="min-w-0 flex-1" />
    </div>

    <!-- Small screens: the controls open in a sheet; the command stays one tap away. -->
    <div class="bg-background/90 supports-[backdrop-filter]:bg-background/75 fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t p-3 backdrop-blur lg:hidden">
      <button ivButton class="flex-1" [ivSheetTrigger]="sheet" [ivSheetConfig]="{ side: 'bottom' }">Customize</button>
      <docs-copy-button [text]="initCommand()" label="Copy install command" />
    </div>
    <ng-template #sheet>
      <iv-sheet-header>
        <iv-sheet-title>Customize</iv-sheet-title>
        <iv-sheet-description>Changes show behind this panel.</iv-sheet-description>
      </iv-sheet-header>
      <div class="flex max-h-[60vh] flex-col gap-6 overflow-y-auto px-4 pb-6">
        <ng-container [ngTemplateOutlet]="controls" [ngTemplateOutletContext]="{ $implicit: 'sheet' }" />
        <iv-separator />
        <ng-container [ngTemplateOutlet]="install" />
      </div>
    </ng-template>

    <ng-template #controls let-at>
      <fieldset class="flex flex-col gap-2.5">
        <legend class="text-foreground mb-2.5 text-sm font-medium">Style</legend>
        <div class="flex flex-wrap gap-1.5">
          @for (s of styles; track s.name) {
            <label [class]="pill">
              <input type="radio" class="sr-only" [name]="at + '-style'" [value]="s.name" [checked]="preset().style === s.name" (change)="set({ style: s.name })" />
              {{ s.label }}
            </label>
          }
        </div>
      </fieldset>

      <fieldset class="flex flex-col">
        <legend class="mb-2.5 flex w-full items-baseline justify-between text-sm">
          <span class="text-foreground font-medium">Base color</span>
          <span class="text-muted-foreground" aria-hidden="true">{{ colorTitle() }}</span>
        </legend>
        <div class="flex flex-wrap gap-2">
          @for (c of colors; track c.name) {
            <label
              class="has-checked:ring-foreground has-focus-visible:outline-ring ring-border flex size-8 cursor-pointer items-center justify-center rounded-full ring-1 ring-offset-2 ring-offset-background transition-shadow has-checked:ring-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-4"
              [title]="c.title"
            >
              <input type="radio" class="sr-only" [name]="at + '-color'" [value]="c.name" [attr.aria-label]="c.title" [checked]="preset().baseColor === c.name" (change)="set({ baseColor: c.name })" />
              <span class="size-full rounded-full" [style.background]="swatch(c.light)" aria-hidden="true"></span>
            </label>
          }
        </div>
      </fieldset>

      <div class="flex flex-col gap-2.5">
        <span class="text-foreground text-sm font-medium" [id]="at + '-font-label'">Font</span>
        <iv-select [value]="preset().font" (valueChange)="set({ font: $event ?? 'system' })">
          <iv-select-trigger class="w-full" [aria-labelledby]="at + '-font-label'" />
          <iv-select-content>
            <iv-select-item value="system">System</iv-select-item>
            @for (g of fontGroups; track g.label) {
              <iv-select-separator />
              <iv-select-group>
                <iv-select-label>{{ g.label }}</iv-select-label>
                @for (f of g.fonts; track f.name) {
                  <iv-select-item [value]="f.name">{{ f.title }}</iv-select-item>
                }
              </iv-select-group>
            }
          </iv-select-content>
        </iv-select>
      </div>

      <div class="flex flex-col gap-2.5">
        <span class="text-foreground text-sm font-medium" [id]="at + '-heading-label'">Heading font</span>
        <iv-select [value]="preset().fontHeading" (valueChange)="set({ fontHeading: $event ?? 'inherit' })">
          <iv-select-trigger class="w-full" [aria-labelledby]="at + '-heading-label'" />
          <iv-select-content>
            <iv-select-item value="inherit">Same as font</iv-select-item>
            @for (g of fontGroups; track g.label) {
              <iv-select-separator />
              <iv-select-group>
                <iv-select-label>{{ g.label }}</iv-select-label>
                @for (f of g.fonts; track f.name) {
                  <iv-select-item [value]="f.name">{{ f.title }}</iv-select-item>
                }
              </iv-select-group>
            }
          </iv-select-content>
        </iv-select>
      </div>

      <fieldset class="flex flex-col">
        <legend class="text-foreground mb-2.5 text-sm font-medium">Radius</legend>
        <div class="grid grid-cols-5 gap-1.5">
          @for (r of radii; track r.name) {
            <label [class]="tile">
              <input type="radio" class="sr-only" [name]="at + '-radius'" [value]="r.name" [checked]="preset().radius === r.name" (change)="set({ radius: r.name })" />
              <!-- One corner, drawn at twice the radius so small steps stay visible. -->
              <span class="border-foreground/70 size-5 border-t-2 border-l-2" [style.border-top-left-radius]="r.corner" aria-hidden="true"></span>
              <span class="text-[0.6875rem]">{{ r.label }}</span>
            </label>
          }
        </div>
      </fieldset>

      <fieldset class="flex flex-col">
        <legend class="text-foreground mb-2.5 text-sm font-medium">Mode</legend>
        <div class="flex flex-wrap gap-1.5">
          @for (m of modes; track m.value) {
            <label [class]="pill">
              <input type="radio" class="sr-only" [name]="at + '-mode'" [value]="m.value" [checked]="appearance.state().mode === m.value" (change)="setMode(m.value)" />
              {{ m.label }}
            </label>
          }
        </div>
      </fieldset>
    </ng-template>

    <ng-template #install>
      <div class="flex flex-col gap-4">
        @for (c of commands(); track c.label) {
          <div class="flex flex-col gap-1.5">
            <span class="text-foreground text-sm font-medium">{{ c.label }}</span>
            <div class="bg-muted/60 flex items-center gap-2 rounded-md border py-1 pr-1 pl-3 font-mono text-xs">
              <span class="min-w-0 flex-1 truncate" [title]="c.command">{{ c.command }}</span>
              <docs-copy-button [text]="c.command" [label]="'Copy ' + c.label.toLowerCase() + ' command'" />
            </div>
          </div>
        }
        <div class="flex gap-2">
          <button ivButton variant="outline" size="sm" class="flex-1" [ivDialogTrigger]="cssDialog">Show CSS</button>
          <button ivButton variant="ghost" size="sm" class="flex-1" [disabled]="isDefault()" (click)="reset()">Reset</button>
        </div>
      </div>
    </ng-template>

    <ng-template #cssDialog>
      <iv-dialog-header>
        <iv-dialog-title>theme.css variables</iv-dialog-title>
        <iv-dialog-description>The commands write this for you. Paste it to change the look by hand.</iv-dialog-description>
      </iv-dialog-header>
      <div class="relative min-w-0">
        <pre class="bg-muted/60 max-h-[50vh] overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed"><code>{{ look.css() }}</code></pre>
        <docs-copy-button class="absolute top-2 right-2" [text]="look.css()" label="Copy CSS" />
      </div>
    </ng-template>
  `,
})
export default class PlaygroundPage {
  protected readonly look = inject(PlaygroundLook);
  protected readonly appearance = inject(Appearance);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  /** False until the URL preset is read in the browser, so the server markup and the first client render match. */
  private readonly ready = signal(false);

  protected readonly preset = this.look.preset;
  protected readonly styles = STYLES;
  protected readonly colors = BASE_COLORS;
  protected readonly fontGroups = FONT_GROUPS;
  protected readonly radii = Object.keys(RADII).map((name) => ({
    name,
    label: RADIUS_LABELS[name] ?? name,
    corner: `calc(${RADII[name] ?? '0.625rem'} * 2)`,
  }));
  protected readonly modes: { value: ColorMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];
  protected readonly pill =
    'has-checked:bg-primary has-checked:text-primary-foreground has-checked:border-primary hover:bg-muted has-focus-visible:outline-ring flex h-8 cursor-pointer items-center rounded-full border px-3 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2';
  protected readonly tile =
    'has-checked:border-foreground has-checked:bg-muted hover:bg-muted/60 has-focus-visible:outline-ring text-muted-foreground has-checked:text-foreground flex cursor-pointer flex-col items-center gap-1.5 rounded-md border px-1 pt-2.5 pb-1.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2';

  protected readonly colorTitle = computed(() => BASE_COLORS.find((c) => c.name === this.preset().baseColor)?.title);
  protected readonly isDefault = computed(() => this.look.code() === DEFAULT_CODE);
  private readonly presetArg = computed(() => (this.isDefault() ? '' : ` --preset ${this.look.code()}`));
  protected readonly initCommand = computed(() => `npx ivorie init${this.presetArg()}`);
  protected readonly commands = computed(() => [
    { label: 'New app', command: this.initCommand() },
    { label: 'Existing app', command: `npx ivorie apply ${this.isDefault() ? 'default' : this.look.code()}` },
  ]);

  constructor() {
    afterNextRender(() => {
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

  protected set(patch: Partial<Preset>): void {
    this.look.set(patch);
  }

  protected setMode(mode: ColorMode): void {
    this.appearance.setMode(mode);
  }

  protected reset(): void {
    this.look.load(null);
  }

  /** Light tint and mid tone of a base color, split on the diagonal. */
  protected swatch(light: Record<string, string>): string {
    return `linear-gradient(135deg, ${light['--secondary']} 50%, ${light['--muted-foreground']} 50%)`;
  }
}
