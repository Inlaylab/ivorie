import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { STYLES } from '../shell/appearance-options';
import type { PlaygroundLook } from './playground-look';
import type { Preset } from './preset-code';

/** One line per style, from shadcn/ui. */
const STYLE_NOTES: Record<string, string> = {
  vega: 'Clean, neutral and familiar.',
  nova: 'Less padding and margin.',
  maia: 'Rounded, with generous spacing.',
  luma: 'Fluid, luminous and soft.',
  rhea: 'Like Luma, but compact.',
};
/** Style pictures: a square with the corner feel of each style. */
const STYLE_GLYPHS: Record<string, string> = { vega: '4px', nova: '2px', maia: '999px', luma: '7px', rhea: '5px' };
const RADIUS_LABELS: Record<string, string> = { default: 'Default', none: 'None', small: 'Small', medium: 'Medium', large: 'Large' };
const FONT_GROUPS = (['sans', 'serif', 'mono'] as const).map((type) => ({
  label: { sans: 'Sans', serif: 'Serif', mono: 'Mono' }[type],
  glyph: { sans: 'Aa', serif: 'Ag', mono: '{}' }[type],
  fonts: FONTS.filter((f) => f.type === type),
}));

/** Full: style, color and radius as tiles, fonts as dropdowns. Compact (home hero): style chips and color swatches. */
@Component({
  selector: 'docs-look-controls',
  imports: [NgTemplateOutlet, IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-5' },
  template: `
    @if (compact()) {
      <fieldset>
        <legend class="text-foreground mb-2.5 text-sm font-medium">Style</legend>
        <div class="bg-muted grid grid-cols-5 gap-0.5 rounded-full p-0.5">
          @for (s of styles; track s.name) {
            <label
              class="has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full px-2.5 py-1 text-center text-sm font-medium transition-colors has-focus-visible:outline-2"
            >
              <input type="radio" class="sr-only" [name]="name() + '-style'" [value]="s.name" [checked]="preset().style === s.name" (change)="set({ style: s.name })" />
              {{ s.label }}
            </label>
          }
        </div>
      </fieldset>
      <ng-container [ngTemplateOutlet]="swatches" />
    } @else {
      <!-- Look: every option is visible, so a glance shows what is picked and what else there is. -->
      <section class="flex flex-col gap-5" [attr.aria-labelledby]="name() + '-look'">
        <h2 class="text-muted-foreground text-xs font-medium" [id]="name() + '-look'">Look</h2>
        <fieldset>
          <legend class="text-foreground mb-2.5 text-sm font-medium">Style</legend>
          <div class="grid grid-cols-5 gap-1.5">
            @for (s of styles; track s.name) {
              <label [class]="tile">
                <input type="radio" class="sr-only" [name]="name() + '-style'" [value]="s.name" [checked]="preset().style === s.name" (change)="set({ style: s.name })" />
                <ng-container [ngTemplateOutlet]="styleIcon" [ngTemplateOutletContext]="{ $implicit: s.name }" />
                {{ s.label }}
              </label>
            }
          </div>
          <p class="text-muted-foreground mt-2 text-xs">{{ notes[preset().style] }}</p>
        </fieldset>
        <ng-container [ngTemplateOutlet]="swatches" />
        <fieldset>
          <legend class="text-foreground mb-2.5 text-sm font-medium">Radius</legend>
          <div class="grid grid-cols-5 gap-1.5">
            @for (r of radii; track r.name) {
              <label [class]="tile" [title]="r.value">
                <input type="radio" class="sr-only" [name]="name() + '-radius'" [value]="r.name" [checked]="preset().radius === r.name" (change)="set({ radius: r.name })" />
                <ng-container [ngTemplateOutlet]="radiusIcon" [ngTemplateOutletContext]="{ $implicit: r.corner }" />
                {{ r.label }}
              </label>
            }
          </div>
        </fieldset>
      </section>

      <!-- Type: 27 fonts are too many to lay out, so these stay dropdowns. -->
      <section class="flex flex-col gap-5 border-t pt-5" [attr.aria-labelledby]="name() + '-type'">
        <h2 class="text-muted-foreground text-xs font-medium" [id]="name() + '-type'">Type</h2>
        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium" [id]="name() + '-font-label'">Font</span>
          <iv-select [value]="preset().font" (valueChange)="set({ font: $event ?? 'system' })">
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
                <ng-container [ngTemplateOutlet]="fontIcon" [ngTemplateOutletContext]="{ $implicit: 'Aa' }" />
              </span>
              <iv-select-trigger class="w-full pl-10" [aria-labelledby]="name() + '-font-label'" />
            </div>
            <iv-select-content>
              <iv-select-item value="system">
                <ng-container [ngTemplateOutlet]="fontIcon" [ngTemplateOutletContext]="{ $implicit: 'Aa' }" />
                System
              </iv-select-item>
              @for (g of fontGroups; track g.label) {
                <iv-select-separator />
                <iv-select-group>
                  <iv-select-label>{{ g.label }}</iv-select-label>
                  @for (f of g.fonts; track f.name) {
                    <iv-select-item [value]="f.name">
                      <ng-container [ngTemplateOutlet]="fontIcon" [ngTemplateOutletContext]="{ $implicit: g.glyph }" />
                      {{ f.title }}
                    </iv-select-item>
                  }
                </iv-select-group>
              }
            </iv-select-content>
          </iv-select>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-foreground text-sm font-medium" [id]="name() + '-heading-label'">Heading font</span>
          <iv-select [value]="preset().fontHeading" (valueChange)="set({ fontHeading: $event ?? 'inherit' })">
            <div class="relative">
              <span class="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
                <ng-container [ngTemplateOutlet]="fontIcon" [ngTemplateOutletContext]="{ $implicit: 'H' }" />
              </span>
              <iv-select-trigger class="w-full pl-10" [aria-labelledby]="name() + '-heading-label'" />
            </div>
            <iv-select-content>
              <iv-select-item value="inherit">
                <ng-container [ngTemplateOutlet]="fontIcon" [ngTemplateOutletContext]="{ $implicit: 'H' }" />
                Same as font
              </iv-select-item>
              @for (g of fontGroups; track g.label) {
                <iv-select-separator />
                <iv-select-group>
                  <iv-select-label>{{ g.label }}</iv-select-label>
                  @for (f of g.fonts; track f.name) {
                    <iv-select-item [value]="f.name">
                      <ng-container [ngTemplateOutlet]="fontIcon" [ngTemplateOutletContext]="{ $implicit: g.glyph }" />
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
      <fieldset>
        <legend class="mb-2.5 flex w-full items-baseline justify-between gap-4 text-sm">
          <span class="text-foreground font-medium">Base color</span>
          <span class="text-muted-foreground" aria-hidden="true">{{ colorTitle() }}</span>
        </legend>
        <div class="grid w-max grid-cols-7 gap-2">
          @for (c of colors; track c.name) {
            <label
              class="ring-offset-background has-checked:ring-foreground has-focus-visible:outline-ring flex size-7 cursor-pointer rounded-full ring-1 ring-black/10 ring-offset-2 transition-shadow has-checked:ring-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 dark:ring-white/15"
              [title]="c.title"
            >
              <input type="radio" class="sr-only" [name]="name() + '-color'" [value]="c.name" [attr.aria-label]="c.title" [checked]="preset().baseColor === c.name" (change)="set({ baseColor: c.name })" />
              <span class="size-full rounded-full" [style.background]="swatch(c.light)" aria-hidden="true"></span>
            </label>
          }
        </div>
      </fieldset>
    </ng-template>

    <!-- Pictures. No text nodes: the select reads its labels from text. -->
    <ng-template #styleIcon let-style>
      <span class="border-foreground/70 bg-muted block size-4 shrink-0 border-[1.5px]" [style.border-radius]="glyphs[style]" aria-hidden="true"></span>
    </ng-template>
    <ng-template #fontIcon let-glyph>
      <span class="docs-glyph text-foreground/80 block w-4 shrink-0 text-center text-[0.8125rem] leading-none font-semibold" [attr.data-glyph]="glyph" aria-hidden="true"></span>
    </ng-template>
    <ng-template #radiusIcon let-corner>
      <span class="border-foreground/70 block size-4 shrink-0 border-t-[1.5px] border-l-[1.5px]" [style.border-top-left-radius]="corner" aria-hidden="true"></span>
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
  /** One option in a tile grid: a picture over its name. */
  protected readonly tile =
    'has-checked:border-foreground/60 has-checked:bg-muted has-checked:text-foreground text-muted-foreground hover:bg-muted/50 hover:text-foreground has-focus-visible:outline-ring flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-0.5 py-2.5 text-xs font-medium transition-colors has-focus-visible:outline-2';
  protected readonly styles = STYLES;
  protected readonly notes = STYLE_NOTES;
  protected readonly glyphs = STYLE_GLYPHS;
  protected readonly colors = BASE_COLORS;
  protected readonly fontGroups = FONT_GROUPS;
  protected readonly radii = Object.keys(RADII).map((name) => ({
    name,
    label: RADIUS_LABELS[name] ?? name,
    value: RADII[name] ?? 'theme',
    // Drawn at 1.6x so small steps stay visible in a 16px box.
    corner: `calc(${RADII[name] ?? '0.625rem'} * 1.6)`,
  }));
  protected readonly colorTitle = computed(() => BASE_COLORS.find((c) => c.name === this.preset().baseColor)?.title);

  protected set(patch: Partial<Preset>): void {
    this.look().set(patch);
  }

  /** Light tint and mid tone of a base color, split on the diagonal. */
  protected swatch(light: Record<string, string>): string {
    return `linear-gradient(135deg, ${light['--secondary']} 50%, ${light['--muted-foreground']} 50%)`;
  }
}
