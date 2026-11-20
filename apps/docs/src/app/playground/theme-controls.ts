import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { ACCENTS, BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { THEME_LIST } from '../shell/appearance-options';
import { ThemePicker } from './theme-picker';
import { ICON_LIBRARIES, type PlaygroundLook } from './playground-look';
import { DIALS, type DialKey, type Preset } from './preset-code';


/** What each dial does, in a few words, under its name. */
const DIAL_HINTS: Record<DialKey, string> = {
  density: 'Spacing everywhere',
  contrast: 'Lines and grey text',
  motion: 'Transitions',
  panels: 'See-through or solid panes',
  rim: 'The line of light on top',
  shadow: 'Depth under panes',
  blur: 'Frost behind panes',
  ambient: 'Light on the page',
};
const RADIUS_LABELS: Record<string, string> = { default: 'Auto', none: 'None', small: 'S', medium: 'M', large: 'L' };
const FONT_GROUPS = (['sans', 'serif', 'mono'] as const).map((type) => ({
  label: { sans: 'Sans', serif: 'Serif', mono: 'Mono' }[type],
  fonts: FONTS.filter((f) => f.type === type),
}));
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/**
 * The playground rail: Theme, then Color, Type and shape, and Dials last. Compact (block page): theme tiles only.
 * Every choice is visible: tiles, segmented controls and swatches; selects only for long lists.
 */
@Component({
  selector: 'docs-theme-controls',
  imports: [IV_SELECT_IMPORTS, ThemePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-4' },
  template: `
    <fieldset class="min-w-0">
      <legend class="docs-rail-title mb-2">Theme</legend>
      <docs-theme-picker [look]="look()" [name]="name()" [grouped]="!compact()" [ownOnly]="compact()" />
      <p class="text-muted-foreground mt-2.5 text-xs" data-testid="theme-note">{{ info().note }}</p>
    </fieldset>

    @if (!compact()) {
      <details open class="docs-rail-section">
        <summary class="docs-rail-title">Color</summary>
        <div class="flex flex-col gap-3 pt-1">
          <!-- Accent, base and chart colors: one dropdown each, a color chip left of the value and every item. -->
          @for (row of colorRows(); track row.key) {
            <div class="flex flex-col gap-1" [attr.data-testid]="'color-' + row.id">
              <span class="text-foreground text-xs font-medium" [id]="name() + '-' + row.id + '-label'">{{ row.label }}</span>
              <iv-select [value]="row.value" (valueChange)="pickColor(row.key, $event)">
                <iv-select-trigger class="w-full" [aria-labelledby]="name() + '-' + row.id + '-label'">
                  <span class="docs-color-chip" [style.background]="row.current" aria-hidden="true"></span>
                </iv-select-trigger>
                <iv-select-content class="max-h-[min(24rem,70svh)]">
                  @for (o of row.options; track o.name) {
                    <iv-select-item [value]="o.name">
                      <span class="docs-color-chip" [style.background]="o.color" aria-hidden="true"></span>
                      {{ o.label }}
                    </iv-select-item>
                  }
                </iv-select-content>
              </iv-select>
            </div>
          }
          <fieldset class="flex min-w-0 flex-col gap-1">
            <legend class="text-foreground mb-1 text-xs font-medium">Menu highlight</legend>
            <div role="radiogroup" class="docs-seg" aria-label="Menu highlight">
              @for (m of menuOptions; track m.name) {
                <label>
                  <input type="radio" class="sr-only" [name]="name() + '-menu'" [value]="m.name" [checked]="preset().menuAccent === m.name" (change)="set({ menuAccent: m.name })" />
                  {{ m.label }}
                </label>
              }
            </div>
          </fieldset>
        </div>
      </details>

      <details open class="docs-rail-section">
        <summary class="docs-rail-title">Type and shape</summary>
        <div class="flex flex-col gap-3 pt-1">
          @for (f of fontRows; track f.key) {
            <div class="flex flex-col gap-1" (pointerenter)="look().preloadFonts()" (focusin)="look().preloadFonts()">
              <span class="text-foreground text-xs font-medium" [id]="name() + '-' + f.key + '-label'">{{ f.label }}</span>
              <iv-select [value]="preset()[f.key]" (valueChange)="pick(f.key, $event ?? f.none)">
                <iv-select-trigger class="w-full" [style.font-family]="faceOf(preset()[f.key])" [aria-labelledby]="name() + '-' + f.key + '-label'" />
                <iv-select-content class="max-h-[min(24rem,70svh)]">
                  <iv-select-item [value]="f.none">{{ f.noneLabel }}</iv-select-item>
                  @for (g of fontGroups; track g.label) {
                    <iv-select-separator />
                    <iv-select-group>
                      <iv-select-label>{{ g.label }}</iv-select-label>
                      @for (font of g.fonts; track font.name) {
                        <iv-select-item [value]="font.name"><span [style.font-family]="font.family">{{ font.title }}</span></iv-select-item>
                      }
                    </iv-select-group>
                  }
                </iv-select-content>
              </iv-select>
            </div>
          }
          <fieldset class="flex min-w-0 flex-col gap-1">
            <legend class="text-foreground mb-1 text-xs font-medium">Radius</legend>
            <div role="radiogroup" class="docs-seg" aria-label="Radius">
              @for (r of radii; track r.name) {
                <label [title]="r.title">
                  <input type="radio" class="sr-only" [name]="name() + '-radius'" [value]="r.name" [attr.aria-label]="r.title" [checked]="preset().radius === r.name" (change)="set({ radius: r.name })" />
                  {{ r.label }}
                </label>
              }
            </div>
          </fieldset>
          <div class="flex flex-col gap-1">
            <span class="text-foreground text-xs font-medium" [id]="name() + '-iconLibrary-label'">Icons</span>
            <iv-select [value]="preset().iconLibrary" (valueChange)="pick('iconLibrary', $event)">
              <iv-select-trigger class="w-full" [aria-labelledby]="name() + '-iconLibrary-label'" />
              <iv-select-content>
                @for (l of iconOptions; track l.name) {
                  <iv-select-item [value]="l.name">{{ l.label }}</iv-select-item>
                }
              </iv-select-content>
            </iv-select>
          </div>
        </div>
      </details>

      <details open class="docs-rail-section">
        <summary class="docs-rail-title">Dials</summary>
        <div class="flex flex-col gap-3 pt-1">
          @for (d of dials; track d.key) {
            <fieldset [disabled]="!look().takes(d.key)" [attr.data-dial]="d.key" class="flex min-w-0 flex-col gap-1">
              <legend class="flex w-full items-baseline justify-between gap-2 text-xs">
                <span class="text-foreground font-medium">{{ d.label }}</span>
                <span class="text-muted-foreground">{{ d.hint }}</span>
              </legend>
              <div role="radiogroup" class="docs-seg" [attr.aria-label]="d.label">
                @for (v of d.values; track v.name) {
                  <label>
                    <input type="radio" class="sr-only" [name]="name() + '-' + d.key" [value]="v.name" [checked]="preset()[d.key] === v.name" (change)="pick(d.key, v.name)" />
                    {{ v.label }}
                  </label>
                }
              </div>
              @if (!look().takes(d.key)) {
                <p class="text-muted-foreground text-xs">{{ info().label }} keeps {{ d.key }} fixed</p>
              }
            </fieldset>
          }
        </div>
      </details>
    }
  `,
})
export class ThemeControls {
  readonly look = input.required<PlaygroundLook>();
  /** Radio group names and label ids. Unique per instance on the page. */
  readonly name = input.required<string>();
  /** Theme tiles only (block page). */
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly preset = computed(() => this.look().preset());
  protected readonly dials = (Object.keys(DIALS) as DialKey[]).map((key) => ({
    key,
    label: cap(key),
    hint: DIAL_HINTS[key],
    values: DIALS[key].map((v) => ({ name: v, label: cap(v) })),
  }));
  protected readonly accents = [
    { name: 'base', label: 'None', color: 'linear-gradient(135deg, var(--foreground) 50%, var(--background) 50%)' },
    ...ACCENTS.map((a) => ({ name: a.name, label: a.title, color: a.light['--primary'] })),
  ];
  protected readonly bases = BASE_COLORS.map((c) => ({
    name: c.name,
    label: c.title,
    color: `linear-gradient(135deg, ${c.light['--secondary']} 50%, ${c.light['--muted-foreground']} 50%)`,
  }));
  /** The three color dropdowns: their options, the picked value and its color for the trigger's chip. */
  protected readonly colorRows = computed(() => {
    const p = this.preset();
    const row = (id: string, key: 'accent' | 'baseColor' | 'chartColor', label: string, options: { name: string; label: string; color: string }[]) => ({
      id,
      key,
      label,
      options,
      value: p[key],
      current: options.find((o) => o.name === p[key])?.color ?? 'transparent',
    });
    return [row('accent', 'accent', 'Accent', this.accents), row('base', 'baseColor', 'Base', this.bases), row('chart', 'chartColor', 'Charts', this.chartSwatches())];
  });

  protected pickColor(key: 'accent' | 'baseColor' | 'chartColor', value: string | null): void {
    if (value) this.set({ [key]: value });
  }

  /** Chart color swatches: "same as accent" takes the picked accent's color, "gray" the neutral mix. */
  protected readonly chartSwatches = computed(() => [
    { name: 'accent', label: 'Same as accent', color: this.accents.find((a) => a.name === this.preset().accent)?.color ?? this.accents[0].color },
    { name: 'base', label: 'Gray', color: 'linear-gradient(135deg, var(--muted-foreground) 50%, var(--border) 50%)' },
    ...ACCENTS.map((a) => ({ name: a.name, label: a.title, color: a.light['--primary'] })),
  ]);
  protected readonly menuOptions = [
    { name: 'subtle', label: 'Subtle' },
    { name: 'bold', label: 'Accent' },
  ];
  protected readonly radii = Object.keys(RADII).map((name) => ({ name, label: RADIUS_LABELS[name] ?? name, title: cap(name) }));
  protected readonly iconOptions = ICON_LIBRARIES.map((l) => ({ name: l.name, label: l.label }));
  protected readonly fontGroups = FONT_GROUPS;
  protected readonly fontRows = [
    { key: 'font', label: 'Font', none: 'system', noneLabel: 'System' },
    { key: 'fontHeading', label: 'Heading font', none: 'inherit', noneLabel: 'Same as font' },
  ] as const;

  /** The current theme's label and note. A legacy theme (from a share code) has them too. */
  protected readonly info = computed(() => {
    const t = this.preset().theme;
    return THEME_LIST.find((x) => x.name === t) ?? { name: t, label: t, note: '' };
  });

  /** The CSS family of a font name, so the pick shows in its own face. */
  protected faceOf(name: string): string | null {
    return FONTS.find((f) => f.name === name)?.family ?? null;
  }

  protected pick(key: keyof Preset, value: string | null): void {
    if (value) this.set({ [key]: value });
  }

  protected set(patch: Partial<Preset>): void {
    this.look().set(patch);
  }
}
