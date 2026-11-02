import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { STYLES } from '../shell/appearance-options';
import type { PlaygroundLook } from './playground-look';
import type { Preset } from './preset-code';

const RADIUS_LABELS: Record<string, string> = { default: 'Default', none: 'None', small: 'Small', medium: 'Medium', large: 'Large' };
const FONT_GROUPS = (['sans', 'serif', 'mono'] as const).map((type) => ({
  label: { sans: 'Sans', serif: 'Serif', mono: 'Mono' }[type],
  fonts: FONTS.filter((f) => f.type === type),
}));

/** Native radios for visual choices (arrow keys, one tab stop), selects for long lists. */
@Component({
  selector: 'docs-look-controls',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <fieldset>
      <legend class="text-foreground mb-2.5 text-sm font-medium">Style</legend>
      <div class="bg-muted inline-flex flex-wrap gap-0.5 rounded-full p-0.5">
        @for (s of styles; track s.name) {
          <label
            class="has-checked:bg-background has-checked:text-foreground has-checked:shadow-xs text-muted-foreground hover:text-foreground has-focus-visible:outline-ring cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors has-focus-visible:outline-2"
          >
            <input type="radio" class="sr-only" [name]="name() + '-style'" [value]="s.name" [checked]="preset().style === s.name" (change)="set({ style: s.name })" />
            {{ s.label }}
          </label>
        }
      </div>
    </fieldset>

    <fieldset>
      <legend class="mb-2.5 flex w-full items-baseline justify-between gap-4 text-sm">
        <span class="text-foreground font-medium">Base color</span>
        <span class="text-muted-foreground" aria-hidden="true">{{ colorTitle() }}</span>
      </legend>
      <div class="flex flex-wrap gap-2">
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

    @if (!compact()) {
      <div class="flex flex-col gap-2.5">
        <span class="text-foreground text-sm font-medium" [id]="name() + '-font-label'">Font</span>
        <iv-select [value]="preset().font" (valueChange)="set({ font: $event ?? 'system' })">
          <iv-select-trigger class="w-full" [aria-labelledby]="name() + '-font-label'" />
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
        <span class="text-foreground text-sm font-medium" [id]="name() + '-heading-label'">Heading font</span>
        <iv-select [value]="preset().fontHeading" (valueChange)="set({ fontHeading: $event ?? 'inherit' })">
          <iv-select-trigger class="w-full" [aria-labelledby]="name() + '-heading-label'" />
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

      <fieldset>
        <legend class="text-foreground mb-2.5 text-sm font-medium">Radius</legend>
        <div class="grid grid-cols-5 gap-1.5">
          @for (r of radii; track r.name) {
            <label
              class="has-checked:border-foreground has-checked:text-foreground hover:bg-muted/60 has-focus-visible:outline-ring text-muted-foreground flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-1 pt-2.5 pb-1.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2"
            >
              <input type="radio" class="sr-only" [name]="name() + '-radius'" [value]="r.name" [checked]="preset().radius === r.name" (change)="set({ radius: r.name })" />
              <!-- One corner, drawn at twice the radius so small steps stay visible. -->
              <span class="size-5 border-t-2 border-l-2 border-current" [style.border-top-left-radius]="r.corner" aria-hidden="true"></span>
              <span class="text-[0.6875rem]">{{ r.label }}</span>
            </label>
          }
        </div>
      </fieldset>
    }
  `,
})
export class LookControls {
  readonly look = input.required<PlaygroundLook>();
  /** Radio group names and label ids. Unique per instance on the page. */
  readonly name = input.required<string>();
  /** Style and base color only. */
  readonly compact = input(false);

  protected readonly preset = computed(() => this.look().preset());
  protected readonly styles = STYLES;
  protected readonly colors = BASE_COLORS;
  protected readonly fontGroups = FONT_GROUPS;
  protected readonly radii = Object.keys(RADII).map((name) => ({
    name,
    label: RADIUS_LABELS[name] ?? name,
    corner: `calc(${RADII[name] ?? '0.625rem'} * 2)`,
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
