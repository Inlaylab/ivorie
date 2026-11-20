import { DOCUMENT, DestroyRef, Injectable, PLATFORM_ID, Provider, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IV_ICONS, LUCIDE_ICONS, type IconName, type IconSet } from '@inlaylab/ivorie/icon';
import { COMPONENT_ICONS as HUGEICONS } from '@inlaylab/ivorie/icons/hugeicons';
import { COMPONENT_ICONS as PHOSPHOR } from '@inlaylab/ivorie/icons/phosphor';
import { COMPONENT_ICONS as REMIX } from '@inlaylab/ivorie/icons/remix';
import { COMPONENT_ICONS as TABLER } from '@inlaylab/ivorie/icons/tabler';
import { ACCENTS, BASE_COLORS, FONTS, THEMES, THEME_ORDER, RADII, THEME_DIALS, type ThemeName } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { DEFAULT_THEME, THEME_FONTS, THEME_LIST } from '../shell/appearance-options';
import {
  DEFAULT_PRESET,
  DIALS,
  MOTION_OFF_CSS,
  SHARED_DIALS,
  chartSource,
  contrastVars,
  decodePreset,
  dialVars,
  encodePreset,
  lookVars,
  type DialKey,
  type Preset,
} from './preset-code';

/** Where the docs start: the glass theme, which is also the CLI default. */
export const DOCS_PRESET: Preset = THEMES.slate;
import { SCENE_ICONS } from './scene-icons';

/** Fonts styles.css imports from @fontsource-variable itself. Keep in sync with its @import lines. */
const SELF_HOSTED_FONTS = new Set(['geist', 'geist-mono']);

/** The component icon sets the preview can draw, in picker order. */
export const ICON_LIBRARIES: { name: string; label: string; set: IconSet }[] = [
  { name: 'lucide', label: 'Lucide', set: LUCIDE_ICONS },
  { name: 'tabler', label: 'Tabler', set: TABLER },
  { name: 'phosphor', label: 'Phosphor', set: PHOSPHOR },
  { name: 'hugeicons', label: 'Hugeicons', set: HUGEICONS },
  { name: 'remix', label: 'Remix', set: REMIX },
];

/** IV_ICONS for the preview. IvIcon reads it inside a computed, so picking a library redraws every icon. */
export const PREVIEW_ICONS: Provider = {
  provide: IV_ICONS,
  useFactory: () => {
    const look = inject(PlaygroundLook);
    const sets = Object.fromEntries(ICON_LIBRARIES.map((l) => [l.name, l.set]));
    return new Proxy(LUCIDE_ICONS, { get: (_, name) => sets[look.preset().iconLibrary][name as IconName] });
  },
};

/** Close to Tailwind's default sans stack: what `font: system` gives an app. */
const SYSTEM_SANS = "system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";
// shortcut: unpinned CDN versions; pin per font if a release ever breaks a family name.
const fontHref = (dependency: string) => `https://cdn.jsdelivr.net/npm/${dependency}/index.css`;
const family = (name: string) => FONTS.find((f) => f.name === name)!.family;

function valid(p: Preset): boolean {
  const fonts = FONTS.map((f) => f.name);
  return (
    THEME_LIST.some((t) => t.name === p.theme) &&
    BASE_COLORS.some((c) => c.name === p.baseColor) &&
    (p.font === 'system' || fonts.includes(p.font)) &&
    (p.fontHeading === 'inherit' || fonts.includes(p.fontHeading)) &&
    p.radius in RADII &&
    ICON_LIBRARIES.some((l) => l.name === p.iconLibrary) &&
    (p.accent === 'base' || ACCENTS.some((a) => a.name === p.accent)) &&
    (['accent', 'base'].includes(p.chartColor) || ACCENTS.some((a) => a.name === p.chartColor)) &&
    ['subtle', 'bold'].includes(p.menuAccent) &&
    (Object.keys(DIALS) as DialKey[]).every((dial) => DIALS[dial].includes(p[dial]))
  );
}

/** The dials a theme takes. */
const dialsOf = (theme: string): readonly DialKey[] => THEME_DIALS[theme] ?? SHARED_DIALS;

/** Motion off in the preview only: the CLI rule, scoped to preview elements. */
const PREVIEW_MOTION_OFF_CSS = MOTION_OFF_CSS.replace('*,\n  ::before,\n  ::after', '.docs-preview,\n  .docs-preview *,\n  .docs-preview ::before,\n  .docs-preview ::after');

/** The color variables `ivorie` writes for this preset, one mode. Same merge as the CLI (lookVars, then contrast). */
function colorVars(p: Preset, mode: 'light' | 'dark'): Record<string, string> {
  const color = BASE_COLORS.find((c) => c.name === p.baseColor)!;
  const accent = (name: string) => ACCENTS.find((a) => a.name === name)?.[mode];
  const vars = lookVars(color[mode], accent(p.accent), accent(chartSource(p)) ?? color[mode], p.menuAccent);
  return dialsOf(p.theme).includes('contrast') ? { ...vars, ...contrastVars(vars, p.contrast) } : vars;
}

/** The inline vars that show a preset on one element: colors for the mode, radius, fonts and dials. */
export function previewVars(p: Preset, dark: boolean): Record<string, string> {
  const color = BASE_COLORS.find((c) => c.name === p.baseColor)!;
  return {
    ...colorVars(p, dark ? 'dark' : 'light'),
    '--radius': RADII[p.radius] ?? color.light['--radius'],
    '--font-sans': p.font === 'system' ? SYSTEM_SANS : `${family(p.font)}, ${SYSTEM_SANS}`,
    '--font-heading': p.fontHeading === 'inherit' ? 'var(--font-sans)' : family(p.fontHeading),
    'font-family': 'var(--font-sans)',
    ...dialVars(p, dialsOf(p.theme)),
  };
}

const motionOff = (p: Preset) => dialsOf(p.theme).includes('motion') && p.motion === 'off';

/** The :root, .dark and font blocks `ivorie` writes into theme.css for this preset. Same order as the CLI (renderLook). */
function themeCss(p: Preset): string {
  const light = {
    ...colorVars(p, 'light'),
    ...(RADII[p.radius] !== null && { '--radius': RADII[p.radius]! }),
    ...dialVars(p, dialsOf(p.theme)),
  };
  const block = (sel: string, vars: Record<string, string>) =>
    `${sel} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};\n`).join('')}}`;
  const tokens = [
    ...(p.font === 'system' ? [] : [`  --font-sans: ${family(p.font)};`]),
    ...(p.fontHeading === 'inherit' ? [] : [`  --font-heading: ${family(p.fontHeading)};`]),
  ];
  const fonts = tokens.length ? `\n\n@theme {\n${tokens.join('\n')}\n}` : '';
  const motion = motionOff(p) ? `\n\n${MOTION_OFF_CSS.trimEnd()}` : '';
  return `${block(':root', light)}\n\n${block('.dark', colorVars(p, 'dark'))}${fonts}${motion}\n`;
}

/**
 * A preset shown on the elements it is attached to (a preview area, the overlay container), never on
 * the rest of the site. Detached elements, font links and style sheets are cleaned up on destroy.
 * Targets get `docs-preview`: the site's own theme skips them unless the preview is that theme (tools/docs/site-style.ts).
 */
@Injectable()
export class PlaygroundLook {
  private readonly doc = inject(DOCUMENT);
  private readonly appearance = inject(Appearance);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _preset = signal<Preset>({ ...DOCS_PRESET });
  private readonly targets = signal<HTMLElement[]>([]);

  readonly preset = this._preset.asReadonly();
  readonly code = computed(() => encodePreset(this._preset()));
  readonly css = computed(() => themeCss(this._preset()));
  /** The theme the preset is on, whatever colors and dials were changed after. Null for a legacy theme name. */
  readonly themeName = computed<ThemeName | null>(() => THEME_ORDER.find((name) => name === this._preset().theme) ?? null);
  /** The scene icons in the picked library. */
  readonly icons = computed(() => SCENE_ICONS[this._preset().iconLibrary] ?? SCENE_ICONS['lucide']);

  constructor() {
    if (!this.browser) return;
    const applied = new Map<HTMLElement, Set<string>>();
    effect(() => {
      const p = this._preset();
      const vars = previewVars(p, this.appearance.dark());
      const targets = this.targets();
      const apply = () => {
        for (const el of targets) {
          const keys = applied.get(el) ?? new Set<string>();
          applied.set(el, keys);
          // Vars a change no longer sets (a dial back at its default) are removed, not left behind.
          for (const k of keys) if (!(k in vars)) el.style.removeProperty(k);
          for (const [k, v] of Object.entries(vars)) {
            el.style.setProperty(k, v);
            keys.add(k);
          }
          for (const c of [...el.classList]) if (c.startsWith('theme-')) el.classList.remove(c);
          el.classList.add(`theme-${p.theme}`, 'docs-preview');
          // The site's own theme skips a preview in another theme (tools/docs/site-style.ts).
          el.classList.toggle('docs-other', p.theme !== DEFAULT_THEME);
        }
      };
      // A theme change cross-fades instead of snapping, unless motion is reduced. The sheets are
      // preloaded on attach, so the new class finds its sheet and no unstyled frame shows.
      const themeChanged = !!targets[0] && !targets[0].classList.contains(`theme-${p.theme}`);
      const fade =
        themeChanged && 'startViewTransition' in this.doc && !this.doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (fade) this.doc.startViewTransition(apply);
      else apply();
      this.loadThemeSheet(p.theme);
      this.setMotionOff(motionOff(p));
      for (const name of [p.font, p.fontHeading]) {
        // styles.css self-hosts these: a CDN link would load them twice and break the offline SSR smoke.
        if (SELF_HOSTED_FONTS.has(name)) continue;
        const font = FONTS.find((f) => f.name === name);
        // A failed load (offline, blocked CDN) leaves the fallback stack; nothing to handle.
        if (font) this.link(`docs-font-${font.name}`, fontHref(font.dependency));
      }
    });
    inject(DestroyRef).onDestroy(() => {
      for (const [el, keys] of applied) {
        for (const k of keys) el.style.removeProperty(k);
        for (const c of [...el.classList]) if (c.startsWith('theme-')) el.classList.remove(c);
        el.classList.remove('docs-preview', 'docs-other');
      }
      this.doc.head.querySelectorAll('link[id^="docs-font-"], link[id^="docs-theme-"]').forEach((l) => l.remove());
      this.setMotionOff(false);
    });
  }

  /** Links these themes' sheets now, for previews that show them on first paint. Browser only. */
  loadThemes(names: readonly string[]): void {
    if (this.browser) names.forEach((n) => this.loadThemeSheet(n));
  }

  /** Shows the look on this element too. */
  attach(el: HTMLElement): void {
    if (!this.browser) return;
    this.targets.update((t) => (t.includes(el) ? t : [...t, el]));
    // Every theme's sheet, fetched while the page is idle, so a later switch finds it in place.
    const win = this.doc.defaultView;
    const load = () => THEME_LIST.forEach((t) => this.loadThemeSheet(t.name));
    if (win && 'requestIdleCallback' in win) win.requestIdleCallback(load, { timeout: 3000 });
    else setTimeout(load, 1500);
  }

  set(patch: Partial<Preset>): void {
    this._preset.update((p) => {
      const next = { ...p, ...patch };
      // Switching theme brings its font along; leaving it drops that font again. An explicit font in the patch wins.
      if (patch.theme && patch.theme !== p.theme && !patch.font) {
        const from = THEME_FONTS[p.theme];
        const to = THEME_FONTS[patch.theme];
        if (to) next.font = to;
        else if (from && p.font === from) next.font = DEFAULT_PRESET.font;
      }
      return next;
    });
  }

  /** Every field of a look. */
  pickTheme(name: ThemeName): void {
    this._preset.set({ ...THEMES[name] });
  }

  /** True when the current theme takes this dial. */
  takes(dial: DialKey): boolean {
    return dialsOf(this._preset().theme).includes(dial);
  }

  /** A share code from the URL. Anything invalid or unknown gives the defaults. */
  load(code: string | null): void {
    const p = code ? decodePreset(code) : null;
    this._preset.set(p && valid(p) ? p : { ...DOCS_PRESET });
  }

  /** The default theme is in the main CSS; the others are separate bundles (angular.json, inject: false). */
  private loadThemeSheet(theme: string): void {
    if (theme !== DEFAULT_THEME) this.link(`docs-theme-${theme}`, `theme-${theme}.css`);
  }

  private setMotionOff(on: boolean): void {
    const old = this.doc.getElementById('docs-motion-off');
    if (!on) return void old?.remove();
    if (old) return;
    const sheet = this.doc.head.appendChild(this.doc.createElement('style'));
    sheet.id = 'docs-motion-off';
    sheet.textContent = PREVIEW_MOTION_OFF_CSS;
  }

  /** Loads every font's stylesheet, so a font list can show each name in its own face. Browser only, once. */
  preloadFonts(): void {
    if (!this.browser) return;
    for (const f of FONTS) this.link(`docs-font-${f.name}`, fontHref(f.dependency));
  }

  private link(id: string, href: string): HTMLLinkElement {
    const old = this.doc.getElementById(id) as HTMLLinkElement | null;
    if (old) return old;
    const link = this.doc.head.appendChild(this.doc.createElement('link'));
    link.id = id;
    link.rel = 'stylesheet';
    link.setAttribute('href', href);
    return link;
  }
}
