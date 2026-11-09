import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IvIcon } from '@inlaylab/ivorie/icon';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IV_TOOLTIP_IMPORTS } from '@inlaylab/ivorie/tooltip';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { STYLES } from '../shell/appearance-options';
import { ICON_LIBRARIES, type PlaygroundLook } from './playground-look';
import type { Preset } from './preset-code';

/** One line per style: shadcn/ui's words for its five, ours for the rest. */
export const STYLE_NOTES: Record<string, string> = {
  vega: 'Clean, neutral and familiar.',
  nova: 'Less padding and margin.',
  maia: 'Rounded, with generous spacing.',
  luma: 'Fluid, luminous and soft.',
  rhea: 'Like Luma, but compact.',
  glass: 'Frosted, see-through surfaces.',
  brutal: 'Hard borders, offset shadows.',
  aurora: 'Gradient edges and a soft glow.',
  bento: 'Tonal tiles, no outlines.',
  mono: 'Flat and dense, made for a mono font.',
};
const RADIUS_LABELS: Record<string, string> = {
  default: 'Default',
  none: 'None',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};
const FONT_GROUPS = (['sans', 'serif', 'mono'] as const).map((type) => ({
  label: { sans: 'Sans', serif: 'Serif', mono: 'Mono' }[type],
  fonts: FONTS.filter((f) => f.type === type),
}));

/** Light tint and mid tone of a base color, split on the diagonal. */
function swatch(light: Record<string, string>): string {
  return `linear-gradient(135deg, ${light['--secondary']} 50%, ${light['--muted-foreground']} 50%)`;
}

/** Full (playground panel): one row per axis, label over value; style options have tooltips. Compact (block page): style tiles and color swatches. */
@Component({
  selector: 'docs-look-controls',
  imports: [NgTemplateOutlet, IV_SELECT_IMPORTS, IV_TOOLTIP_IMPORTS, IvIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-5' },
  template: `
    @if (compact()) {
      <fieldset>
        <legend class="text-foreground mb-2.5 text-sm font-medium">Style</legend>
        <div class="grid grid-cols-5 gap-1.5 lg:grid-cols-2">
          @for (s of styles; track s.name) {
            <ng-container
              [ngTemplateOutlet]="styleTile"
              [ngTemplateOutletContext]="{ $implicit: s, small: true }"
            />
          }
        </div>
        <p class="text-muted-foreground mt-2.5 text-xs" data-testid="style-note">
          {{ notes[preset().style] }}
        </p>
      </fieldset>
      <ng-container [ngTemplateOutlet]="swatches" />
    } @else {
      <!-- Rows: a small label over the picked value, its picture on the right. Each row opens a list. -->
      <h2 class="sr-only" [id]="name() + '-look'">Look</h2>
      <div class="docs-panel flex flex-col gap-0.5" role="group" [attr.aria-labelledby]="name() + '-look'">
        <ng-container [ngTemplateOutlet]="picker" [ngTemplateOutletContext]="{ key: 'mode', label: 'Mode', options: modeOptions, picture: modeIcon }" />
        <ng-container
          [ngTemplateOutlet]="picker"
          [ngTemplateOutletContext]="{ key: 'style', label: 'Style', options: styleOptions, picture: styleIcon, notes: notes }"
        />
        <hr class="my-1.5" />
        <ng-container [ngTemplateOutlet]="picker" [ngTemplateOutletContext]="{ key: 'baseColor', label: 'Base color', options: colorOptions, picture: swatchIcon }" />
        <ng-container [ngTemplateOutlet]="picker" [ngTemplateOutletContext]="{ key: 'radius', label: 'Radius', options: radii, picture: radiusIcon }" />
        <ng-container [ngTemplateOutlet]="picker" [ngTemplateOutletContext]="{ key: 'iconLibrary', label: 'Icons', options: iconOptions, picture: libraryIcon }" />
        <hr class="my-1.5" />
        <!-- Fonts: grouped by kind, each name set in its own face. The faces load when the row is first used. -->
        @for (f of fontRows; track f.key) {
          <div class="docs-panel-row" (pointerenter)="look().preloadFonts()" (focusin)="look().preloadFonts()">
            <span class="docs-row-label" [id]="name() + '-' + f.key + '-label'">{{ f.label }}</span>
            <span class="docs-row-picture text-foreground/80 text-sm font-semibold" [style.font-family]="faceOf(valueOf(f.key))" aria-hidden="true">Aa</span>
            <iv-select [value]="valueOf(f.key)" (valueChange)="pick(f.key, $event ?? f.none)">
              <iv-select-trigger [style.font-family]="faceOf(valueOf(f.key))" [aria-labelledby]="name() + '-' + f.key + '-label'" />
              <iv-select-content>
                <iv-select-item [value]="f.none">{{ f.noneLabel }}</iv-select-item>
                @for (g of fontGroups; track g.label) {
                  <iv-select-separator />
                  <iv-select-group>
                    <iv-select-label>{{ g.label }}</iv-select-label>
                    @for (font of g.fonts; track font.name) {
                      <iv-select-item [value]="font.name">
                        <span class="text-[0.9375rem]" [style.font-family]="font.family">{{ font.title }}</span>
                      </iv-select-item>
                    }
                  </iv-select-group>
                }
              </iv-select-content>
            </iv-select>
          </div>
        }
      </div>
    }

    <ng-template #swatches>
      <fieldset class="min-w-0">
        <legend class="mb-2.5 flex w-full items-baseline justify-between gap-4 text-sm">
          <span class="text-foreground font-medium">Base color</span>
          <span class="text-muted-foreground" aria-hidden="true">{{ colorTitle() }}</span>
        </legend>
        <div class="grid max-w-[15.25rem] grid-cols-7 gap-2">
          @for (c of colors; track c.name) {
            <label
              class="ring-offset-background has-checked:ring-foreground has-focus-visible:outline-ring flex aspect-square w-full max-w-7 cursor-pointer rounded-full ring-1 ring-black/10 ring-offset-2 transition-shadow has-checked:ring-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 dark:ring-white/15"
              [title]="c.title"
            >
              <input
                type="radio"
                class="sr-only"
                [name]="name() + '-color'"
                [value]="c.name"
                [attr.aria-label]="c.title"
                [checked]="preset().baseColor === c.name"
                (change)="set({ baseColor: c.name })"
              />
              <span
                class="size-full rounded-full"
                [style.background]="swatch(c.light)"
                aria-hidden="true"
              ></span>
            </label>
          }
        </div>
      </fieldset>
    </ng-template>

    <!-- One row: the label over the picked value, the value's picture on the right. Options show their picture;
         style options explain themselves in a tooltip. -->
    <ng-template #picker let-key="key" let-label="label" let-options="options" let-picture="picture" let-notes="notes">
      <div class="docs-panel-row">
        <span class="docs-row-label" [id]="name() + '-' + key + '-label'">{{ label }}</span>
        <span class="docs-row-picture">
          <ng-container [ngTemplateOutlet]="picture" [ngTemplateOutletContext]="{ $implicit: pictureOf(options, valueOf(key)) }" />
        </span>
        <iv-select [value]="valueOf(key)" (valueChange)="pick(key, $event)">
          <iv-select-trigger [aria-labelledby]="name() + '-' + key + '-label'" />
          <iv-select-content>
            @for (o of options; track o.name) {
              <iv-select-item [value]="o.name">
                <ng-container [ngTemplateOutlet]="picture" [ngTemplateOutletContext]="{ $implicit: o.picture }" />
                @if (notes) {
                  <iv-tooltip class="block flex-1" [delayDuration]="200">
                    <span ivTooltipTrigger class="block">{{ o.label }}</span>
                    <iv-tooltip-content side="right" [sideOffset]="16">{{ notes[o.name] }}</iv-tooltip-content>
                  </iv-tooltip>
                } @else {
                  {{ o.label }}
                }
              </iv-select-item>
            }
          </iv-select-content>
        </iv-select>
      </div>
    </ng-template>

    <!-- One style as a radio tile: a specimen of the look above its name. -->
    <ng-template #styleTile let-s let-small="small">
      <label
        class="hover:bg-muted/60 has-checked:border-foreground has-checked:ring-foreground has-focus-visible:outline-ring flex cursor-pointer flex-col gap-1.5 rounded-xl border p-1 transition-colors has-checked:ring-1 has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
        [title]="small ? notes[s.name] : null"
      >
        <input
          type="radio"
          class="sr-only"
          [name]="name() + '-style'"
          [value]="s.name"
          [checked]="preset().style === s.name"
          (change)="set({ style: s.name })"
        />
        <span
          class="docs-specimen"
          [class.docs-specimen-sm]="small"
          [attr.data-style]="s.name"
          aria-hidden="true"
        >
          <span class="docs-specimen-card"></span>
          <span class="docs-specimen-button"></span>
        </span>
        <span
          class="text-foreground px-1 pb-0.5 font-medium"
          [class]="small ? 'text-xs' : 'text-sm'"
          >{{ s.label }}</span
        >
      </label>
    </ng-template>

    <!-- Pictures. No text nodes: the select reads its labels from text. -->
    <ng-template #fontIcon let-glyph>
      <span
        class="docs-glyph text-foreground/80 block w-4 shrink-0 text-center text-[0.8125rem] leading-none font-semibold"
        [attr.data-glyph]="glyph"
        aria-hidden="true"
      ></span>
    </ng-template>
    <ng-template #styleIcon let-style>
      <span class="docs-specimen docs-specimen-xs" [attr.data-style]="style" aria-hidden="true"><span class="docs-specimen-card"></span></span>
    </ng-template>
    <ng-template #modeIcon let-dark>
      <span
        class="border-foreground/60 block size-4 shrink-0 rounded-full border-[1.5px]"
        [style.background]="dark ? 'linear-gradient(90deg, currentColor 50%, transparent 50%)' : 'transparent'"
        aria-hidden="true"
      ></span>
    </ng-template>
    <ng-template #swatchIcon let-background>
      <span
        class="block size-4 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/15"
        [style.background]="background"
        aria-hidden="true"
      ></span>
    </ng-template>
    <ng-template #libraryIcon let-icon>
      <svg [ivIcon]="icon" class="text-foreground/80 size-4 shrink-0"></svg>
    </ng-template>
    <ng-template #radiusIcon let-corner>
      <span
        class="border-foreground/70 block size-4 shrink-0 border-t-[1.5px] border-l-[1.5px]"
        [style.border-top-left-radius]="corner"
        aria-hidden="true"
      ></span>
    </ng-template>
  `,
})
export class LookControls {
  readonly look = input.required<PlaygroundLook>();
  /** Radio group names and label ids. Unique per instance on the page. */
  readonly name = input.required<string>();
  /** Style chips and color swatches only. */
  readonly compact = input(false, { transform: booleanAttribute });

  private readonly appearance = inject(Appearance);
  protected readonly preset = computed(() => this.look().preset());
  protected readonly styles = STYLES;
  protected readonly notes = STYLE_NOTES;
  protected readonly colors = BASE_COLORS;
  protected readonly fontGroups = FONT_GROUPS;
  // Dropdown options: value, label, and what the option's picture template takes.
  protected readonly modeOptions = [
    { name: 'light', label: 'Light', picture: false },
    { name: 'dark', label: 'Dark', picture: true },
  ];
  protected readonly styleOptions = STYLES.map((s) => ({ name: s.name, label: s.label, picture: s.name }));
  protected readonly fontRows = [
    { key: 'fontHeading', label: 'Heading font', none: 'inherit', noneLabel: 'Same as font' },
    { key: 'font', label: 'Font', none: 'system', noneLabel: 'System' },
  ] as const;
  protected readonly colorOptions = BASE_COLORS.map((c) => ({
    name: c.name,
    label: c.title,
    picture: swatch(c.light),
  }));
  protected readonly radii = Object.keys(RADII).map((name) => ({
    name,
    label: RADIUS_LABELS[name] ?? name,
    // Drawn at 1.6x so small steps stay visible in a 16px box.
    picture: `calc(${RADII[name] ?? '0.625rem'} * 1.6)`,
  }));
  protected readonly iconOptions = ICON_LIBRARIES.map((l) => ({
    name: l.name,
    label: l.label,
    picture: l.set['circle-check'],
  }));
  protected pictureOf(options: { name: string; picture: unknown }[], value: string): unknown {
    return options.find((o) => o.name === value)?.picture;
  }

  /** The CSS family of a font name, for showing the pick in its own face. System and "same as font" use the site face. */
  protected faceOf(name: string): string | null {
    return FONTS.find((f) => f.name === name)?.family ?? null;
  }

  /** A preset key, or `mode`: light and dark are the site's, shared with the preview. */
  protected valueOf(key: keyof Preset | 'mode'): string {
    if (key === 'mode') return this.appearance.dark() ? 'dark' : 'light';
    return this.preset()[key];
  }

  protected pick(key: keyof Preset | 'mode', value: string | null): void {
    if (!value) return;
    if (key === 'mode') this.appearance.setMode(value as 'light' | 'dark');
    else this.set({ [key]: value });
  }

  protected readonly colorTitle = computed(
    () => BASE_COLORS.find((c) => c.name === this.preset().baseColor)?.title,
  );

  protected set(patch: Partial<Preset>): void {
    this.look().set(patch);
  }

  protected readonly swatch = swatch;
}
