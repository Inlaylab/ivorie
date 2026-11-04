import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IvIcon } from '@inlaylab/ivorie/icon';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { STYLES } from '../shell/appearance-options';
import { ICON_LIBRARIES, type PlaygroundLook } from './playground-look';
import type { Preset } from './preset-code';

/** One line per style: shadcn/ui's words for its five, ours for the rest. */
const STYLE_NOTES: Record<string, string> = {
  vega: 'Clean, neutral and familiar.',
  nova: 'Less padding and margin.',
  maia: 'Rounded, with generous spacing.',
  luma: 'Fluid, luminous and soft.',
  rhea: 'Like Luma, but compact.',
  glass: 'Frosted, see-through surfaces.',
  brutal: 'Hard borders, offset shadows.',
  aurora: 'Gradient edges and a soft glow.',
  bento: 'Tonal tiles, no outlines.',
  mono: 'Monospace, dense and flat.',
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
  glyph: { sans: 'Aa', serif: 'Ag', mono: '{}' }[type],
  fonts: FONTS.filter((f) => f.type === type),
}));

/** Light tint and mid tone of a base color, split on the diagonal. */
function swatch(light: Record<string, string>): string {
  return `linear-gradient(135deg, ${light['--secondary']} 50%, ${light['--muted-foreground']} 50%)`;
}

/** Full: a style gallery, then every other axis as a dropdown. Compact (home showcase): style tiles and color swatches. */
@Component({
  selector: 'docs-look-controls',
  imports: [NgTemplateOutlet, IV_SELECT_IMPORTS, IvIcon],
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
      <!-- Look: one dropdown per axis, like the fonts. Each option shows a picture of itself. -->
      <section class="flex flex-col gap-5" [attr.aria-labelledby]="name() + '-look'">
        <h2 class="text-muted-foreground text-xs font-medium" [id]="name() + '-look'">Look</h2>
        <!-- Style: a gallery, each tile a small specimen of the look (docs styles.css, .docs-specimen). -->
        <fieldset class="flex flex-col gap-2.5">
          <legend class="text-foreground mb-2 text-sm font-medium">Style</legend>
          @for (g of styleGroups; track g.label) {
            <div class="flex flex-col gap-1.5" role="presentation">
              <span class="text-muted-foreground text-xs">{{ g.label }}</span>
              <div class="grid grid-cols-3 gap-1.5">
                @for (s of g.styles; track s.name) {
                  <ng-container
                    [ngTemplateOutlet]="styleTile"
                    [ngTemplateOutletContext]="{ $implicit: s, small: true }"
                  />
                }
              </div>
            </div>
          }
          <p class="text-muted-foreground text-xs" data-testid="style-note">
            {{ notes[preset().style] }}
          </p>
        </fieldset>
        <ng-container
          [ngTemplateOutlet]="picker"
          [ngTemplateOutletContext]="{
            key: 'baseColor',
            label: 'Base color',
            options: colorOptions,
            picture: swatchIcon,
          }"
        />
        <ng-container
          [ngTemplateOutlet]="picker"
          [ngTemplateOutletContext]="{
            key: 'radius',
            label: 'Radius',
            options: radii,
            picture: radiusIcon,
          }"
        />
        <ng-container
          [ngTemplateOutlet]="picker"
          [ngTemplateOutletContext]="{
            key: 'iconLibrary',
            label: 'Icons',
            options: iconOptions,
            picture: libraryIcon,
          }"
        />
      </section>

      <!-- Type: 27 fonts are too many to lay out, so these stay dropdowns. -->
      <section class="flex flex-col gap-5 border-t pt-5" [attr.aria-labelledby]="name() + '-type'">
        <h2 class="text-muted-foreground text-xs font-medium" [id]="name() + '-type'">Type</h2>
        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium" [id]="name() + '-font-label'"
            >Font</span
          >
          <iv-select [value]="preset().font" (valueChange)="set({ font: $event ?? 'system' })">
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
                <ng-container
                  [ngTemplateOutlet]="fontIcon"
                  [ngTemplateOutletContext]="{ $implicit: 'Aa' }"
                />
              </span>
              <iv-select-trigger class="w-full pl-10" [aria-labelledby]="name() + '-font-label'" />
            </div>
            <iv-select-content>
              <iv-select-item value="system">
                <ng-container
                  [ngTemplateOutlet]="fontIcon"
                  [ngTemplateOutletContext]="{ $implicit: 'Aa' }"
                />
                System
              </iv-select-item>
              @for (g of fontGroups; track g.label) {
                <iv-select-separator />
                <iv-select-group>
                  <iv-select-label>{{ g.label }}</iv-select-label>
                  @for (f of g.fonts; track f.name) {
                    <iv-select-item [value]="f.name">
                      <ng-container
                        [ngTemplateOutlet]="fontIcon"
                        [ngTemplateOutletContext]="{ $implicit: g.glyph }"
                      />
                      {{ f.title }}
                    </iv-select-item>
                  }
                </iv-select-group>
              }
            </iv-select-content>
          </iv-select>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium" [id]="name() + '-heading-label'"
            >Heading font</span
          >
          <iv-select
            [value]="preset().fontHeading"
            (valueChange)="set({ fontHeading: $event ?? 'inherit' })"
          >
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
                <ng-container
                  [ngTemplateOutlet]="fontIcon"
                  [ngTemplateOutletContext]="{ $implicit: 'H' }"
                />
              </span>
              <iv-select-trigger
                class="w-full pl-10"
                [aria-labelledby]="name() + '-heading-label'"
              />
            </div>
            <iv-select-content>
              <iv-select-item value="inherit">
                <ng-container
                  [ngTemplateOutlet]="fontIcon"
                  [ngTemplateOutletContext]="{ $implicit: 'H' }"
                />
                Same as font
              </iv-select-item>
              @for (g of fontGroups; track g.label) {
                <iv-select-separator />
                <iv-select-group>
                  <iv-select-label>{{ g.label }}</iv-select-label>
                  @for (f of g.fonts; track f.name) {
                    <iv-select-item [value]="f.name">
                      <ng-container
                        [ngTemplateOutlet]="fontIcon"
                        [ngTemplateOutletContext]="{ $implicit: g.glyph }"
                      />
                      {{ f.title }}
                    </iv-select-item>
                  }
                </iv-select-group>
              }
            </iv-select-content>
          </iv-select>
        </div>
      </section>
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

    <!-- One labelled dropdown. The trigger shows the picked option's picture. -->
    <ng-template
      #picker
      let-key="key"
      let-label="label"
      let-options="options"
      let-picture="picture"
    >
      <div class="flex flex-col gap-2">
        <span class="text-foreground text-sm font-medium" [id]="name() + '-' + key + '-label'">{{
          label
        }}</span>
        <iv-select [value]="valueOf(key)" (valueChange)="pick(key, $event)">
          <div class="relative">
            <span class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
              <ng-container
                [ngTemplateOutlet]="picture"
                [ngTemplateOutletContext]="{ $implicit: pictureOf(options, valueOf(key)) }"
              />
            </span>
            <iv-select-trigger
              class="w-full pl-10"
              [aria-labelledby]="name() + '-' + key + '-label'"
            />
          </div>
          <iv-select-content>
            @for (o of options; track o.name) {
              <iv-select-item [value]="o.name">
                <ng-container
                  [ngTemplateOutlet]="picture"
                  [ngTemplateOutletContext]="{ $implicit: o.picture }"
                />
                {{ o.label }}
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

  protected readonly preset = computed(() => this.look().preset());
  protected readonly styles = STYLES;
  protected readonly notes = STYLE_NOTES;
  protected readonly colors = BASE_COLORS;
  protected readonly fontGroups = FONT_GROUPS;
  protected readonly styleGroups = [
    { label: 'From shadcn/ui', styles: STYLES.filter((s) => !s.own) },
    { label: 'Ivorie', styles: STYLES.filter((s) => s.own) },
  ];
  // Dropdown options: value, label, and what the option's picture template takes.
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

  protected valueOf(key: keyof Preset): string {
    return this.preset()[key];
  }

  protected pick(key: keyof Preset, value: string | null): void {
    if (value) this.set({ [key]: value });
  }

  protected readonly colorTitle = computed(
    () => BASE_COLORS.find((c) => c.name === this.preset().baseColor)?.title,
  );

  protected set(patch: Partial<Preset>): void {
    this.look().set(patch);
  }

  protected readonly swatch = swatch;
}
