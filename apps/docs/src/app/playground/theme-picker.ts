import { ChangeDetectionStrategy, Component, afterNextRender, booleanAttribute, computed, inject, input } from '@angular/core';
import { THEMES, THEME_ORDER, type ThemeName } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { DEFAULT_THEME, THEME_LIST } from '../shell/appearance-options';
import { IvButton } from '@inlaylab/ivorie/button';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { previewVars, type PlaygroundLook } from './playground-look';

/**
 * The theme picker, shared by Home and the Playground. Home: one row of tiles, each with a real button and
 * switch in its theme. `grouped` (Playground rail): one dropdown, Ivorie and Classic as groups, each item with
 * three colour dots and one word; the stage next to it is the preview.
 */
@Component({
  selector: 'docs-theme-picker',
  imports: [IvButton, IvSwitch, IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (grouped()) {
      <div data-testid="theme-select">
        <iv-select [value]="look().themeName() ?? ''" (valueChange)="pickFromList($event)">
          <iv-select-trigger class="w-full" aria-label="Theme" />
          <iv-select-content class="max-h-[min(28rem,70svh)]">
            @for (group of groups(); track group.label; let first = $first) {
              @if (!first) {
                <iv-select-separator />
              }
              <iv-select-group>
                <iv-select-label>{{ group.label }}</iv-select-label>
                @for (t of group.themes; track t.name) {
                  <iv-select-item [value]="t.name" [title]="t.note">
                    <!-- The theme's ground, accent and a chart color, from its own default colors. -->
                    <span class="flex shrink-0 gap-1" [style]="vars()[t.name]" aria-hidden="true">
                      <span class="docs-theme-dot" style="background: var(--background)"></span>
                      <span class="docs-theme-dot" style="background: var(--primary)"></span>
                      <span class="docs-theme-dot" style="background: var(--chart-3)"></span>
                    </span>
                    {{ t.label }}
                    <!-- Drawn by CSS: the trigger shows the item's text, so the word stays out of it. -->
                    <span class="docs-glyph text-muted-foreground ml-auto pl-3 text-xs" [attr.data-glyph]="t.tag" aria-hidden="true"></span>
                  </iv-select-item>
                }
              </iv-select-group>
            }
          </iv-select-content>
        </iv-select>
      </div>
    } @else if (chips()) {
      <!-- Home: light chips, the name and three dots in the theme's own colors. No live parts, so they load at once. -->
      <div role="radiogroup" aria-label="Theme" class="flex flex-wrap justify-center gap-2">
        @for (t of flat(); track t.name) {
          <label
            data-testid="theme-chip"
            [attr.data-theme]="t.name"
            [title]="t.note"
            class="docs-pane has-checked:border-foreground has-focus-visible:outline-ring text-muted-foreground has-checked:text-foreground hover:text-foreground flex h-9 cursor-pointer items-center gap-2 rounded-full pr-3.5 pl-2.5 text-[0.8125rem] font-medium transition-colors duration-(--docs-dur) has-focus-visible:outline-2"
          >
            <input
              type="radio"
              class="sr-only"
              [name]="name() + '-theme'"
              [value]="t.name"
              [attr.aria-description]="t.note"
              [checked]="look().themeName() === t.name"
              (change)="look().pickTheme(t.name)"
            />
            <span data-testid="theme-dots" class="flex shrink-0 gap-1" [style]="vars()[t.name]" aria-hidden="true">
              <span class="docs-theme-dot" style="background: var(--background)"></span>
              <span class="docs-theme-dot" style="background: var(--primary)"></span>
              <span class="docs-theme-dot" style="background: var(--chart-3)"></span>
            </span>
            {{ t.label }}
          </label>
        }
      </div>
    } @else {
      @for (group of groups(); track group.label) {
        <div role="radiogroup" aria-label="Theme" class="docs-theme-row">
          @for (t of group.themes; track t.name) {
            <label class="docs-theme-option" [title]="t.note">
              <input
                type="radio"
                class="sr-only"
                [name]="name() + '-theme'"
                [value]="t.name"
                [attr.aria-label]="t.label"
                [attr.aria-description]="t.note"
                [checked]="look().themeName() === t.name"
                (change)="look().pickTheme(t.name)"
              />
              <span
                data-testid="theme-preview"
                [attr.data-theme]="t.name"
                class="docs-preview docs-theme-frame"
                [class]="'theme-' + t.name + (t.name === siteTheme ? '' : ' docs-other')"
                [style]="vars()[t.name]"
                inert
              >
                <!-- Real parts in the theme: what you get, not a picture of it. Inert: the radio is the control. -->
                <span class="docs-theme-parts">
                  <button ivButton type="button" size="xs">Save</button>
                  <iv-switch [checked]="true" aria-label="Sample switch" />
                </span>
              </span>
              <span class="docs-theme-check" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5l2.5 2.5L12 5.5" /></svg>
              </span>
              <span class="flex min-w-0 flex-col px-0.5">
                <span class="docs-theme-name text-foreground truncate text-[0.8125rem] leading-tight font-medium">{{ t.label }}</span>
                <span class="docs-theme-tag text-muted-foreground truncate text-xs">{{ t.tag }}</span>
              </span>
            </label>
          }
        </div>
      }
    }
  `,
})
export class ThemePicker {
  readonly look = input.required<PlaygroundLook>();
  /** Radio group name prefix. Unique per instance on the page. */
  readonly name = input.required<string>();
  /** Ivorie and Classic as two labelled grids (rail); otherwise one row. */
  readonly grouped = input(false, { transform: booleanAttribute });
  /** Light chips with colour dots instead of tiles with live parts (Home). */
  readonly chips = input(false, { transform: booleanAttribute });
  /** Ivorie themes only. */
  readonly ownOnly = input(false, { transform: booleanAttribute });

  private readonly appearance = inject(Appearance);
  protected readonly siteTheme = DEFAULT_THEME;

  private readonly all = THEME_ORDER.map((name) => ({ ...THEME_LIST.find((t) => t.name === name)!, name }));
  protected readonly groups = computed(() => {
    const own = this.all.filter((t) => t.group === 'own');
    const classic = this.all.filter((t) => t.group === 'classic');
    if (this.ownOnly()) return [{ label: 'Ivorie', themes: own }];
    return this.grouped() ? [{ label: 'Ivorie', themes: own }, { label: 'Classic (shadcn)', themes: classic }] : [{ label: 'All', themes: this.all }];
  });
  protected readonly flat = computed(() => this.groups().flatMap((g) => g.themes));
  /** The dropdown's values are THEME_ORDER names, so the cast holds. */
  protected pickFromList(name: string | null): void {
    if (name) this.look().pickTheme(name as ThemeName);
  }

  constructor() {
    // Tiles show real parts in each theme: link every theme's sheet now, not on idle, so none paints bare.
    // Chips show only colour dots: no sheet needed until a theme is picked.
    afterNextRender(() => {
      if (!this.grouped() && !this.chips()) this.look().loadThemes(THEME_ORDER);
    });
  }

  /** Each tile's inline vars for the current mode. Density is left out, so every tile keeps one size. */
  protected readonly vars = computed(() => {
    const dark = this.appearance.dark();
    return Object.fromEntries(THEME_ORDER.map((n) => [n, previewVars({ ...THEMES[n], density: 'default' }, dark)]));
  });
}
