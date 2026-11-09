import { DOCUMENT, DestroyRef, Injectable, PLATFORM_ID, Provider, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IV_ICONS, LUCIDE_ICONS, type IconName, type IconSet } from '@inlaylab/ivorie/icon';
import { COMPONENT_ICONS as HUGEICONS } from '@inlaylab/ivorie/icons/hugeicons';
import { COMPONENT_ICONS as PHOSPHOR } from '@inlaylab/ivorie/icons/phosphor';
import { COMPONENT_ICONS as REMIX } from '@inlaylab/ivorie/icons/remix';
import { COMPONENT_ICONS as TABLER } from '@inlaylab/ivorie/icons/tabler';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { DEFAULT_STYLE, STYLES, STYLE_FONTS, type StyleName } from '../shell/appearance-options';
import { DEFAULT_PRESET, decodePreset, encodePreset, type Preset } from './preset-code';
import { SCENE_ICONS } from './scene-icons';

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
    STYLES.some((s) => s.name === p.style) &&
    BASE_COLORS.some((c) => c.name === p.baseColor) &&
    (p.font === 'system' || fonts.includes(p.font)) &&
    (p.fontHeading === 'inherit' || fonts.includes(p.fontHeading)) &&
    p.radius in RADII &&
    ICON_LIBRARIES.some((l) => l.name === p.iconLibrary)
  );
}

/** The :root, .dark and font blocks `ivorie` writes into theme.css for this preset. */
function themeCss(p: Preset): string {
  const color = BASE_COLORS.find((c) => c.name === p.baseColor)!;
  const light = { ...color.light, ...(RADII[p.radius] !== null && { '--radius': RADII[p.radius]! }) };
  const block = (sel: string, vars: Record<string, string>) =>
    `${sel} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};\n`).join('')}}`;
  const tokens = [
    ...(p.font === 'system' ? [] : [`  --font-sans: ${family(p.font)};`]),
    ...(p.fontHeading === 'inherit' ? [] : [`  --font-heading: ${family(p.fontHeading)};`]),
  ];
  const fonts = tokens.length ? `\n\n@theme {\n${tokens.join('\n')}\n}` : '';
  return `${block(':root', light)}\n\n${block('.dark', color.dark)}${fonts}\n`;
}

/**
 * A preset shown on the elements it is attached to (a preview area, the overlay container), never on
 * the rest of the site. Detached elements, font links and style sheets are cleaned up on destroy.
 * shortcut: the site keeps `style-nova` on <body>, so a previewed style wins only where both styles set
 * the same property (its sheet loads later). Exact isolation would need an iframe.
 */
@Injectable()
export class PlaygroundLook {
  private readonly doc = inject(DOCUMENT);
  private readonly appearance = inject(Appearance);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _preset = signal<Preset>({ ...DEFAULT_PRESET });
  private readonly targets = signal<HTMLElement[]>([]);

  readonly preset = this._preset.asReadonly();
  readonly code = computed(() => encodePreset(this._preset()));
  readonly css = computed(() => themeCss(this._preset()));
  /** The scene icons in the picked library. */
  readonly icons = computed(() => SCENE_ICONS[this._preset().iconLibrary] ?? SCENE_ICONS['lucide']);

  constructor() {
    if (!this.browser) return;
    const applied = new Map<HTMLElement, Set<string>>();
    effect(() => {
      const p = this._preset();
      const color = BASE_COLORS.find((c) => c.name === p.baseColor)!;
      const vars: Record<string, string> = {
        ...(this.appearance.dark() ? color.dark : color.light),
        '--radius': RADII[p.radius] ?? color.light['--radius'],
        '--font-sans': p.font === 'system' ? SYSTEM_SANS : `${family(p.font)}, ${SYSTEM_SANS}`,
        '--font-heading': p.fontHeading === 'inherit' ? 'var(--font-sans)' : family(p.fontHeading),
        'font-family': 'var(--font-sans)',
      };
      for (const el of this.targets()) {
        const keys = applied.get(el) ?? new Set<string>();
        applied.set(el, keys);
        for (const [k, v] of Object.entries(vars)) {
          el.style.setProperty(k, v);
          keys.add(k);
        }
        for (const c of [...el.classList]) if (c.startsWith('style-')) el.classList.remove(c);
        el.classList.add(`style-${p.style}`);
      }
      this.loadStyleSheet(p.style);
      for (const name of [p.font, p.fontHeading]) {
        const font = FONTS.find((f) => f.name === name);
        // A failed load (offline, blocked CDN) leaves the fallback stack; nothing to handle.
        if (font) this.link(`docs-font-${font.name}`, fontHref(font.dependency));
      }
    });
    inject(DestroyRef).onDestroy(() => {
      for (const [el, keys] of applied) {
        for (const k of keys) el.style.removeProperty(k);
        for (const c of [...el.classList]) if (c.startsWith('style-')) el.classList.remove(c);
      }
      this.doc.head.querySelectorAll('link[id^="docs-font-"], link[id^="docs-style-"]').forEach((l) => l.remove());
    });
  }

  /** Shows the look on this element too. */
  attach(el: HTMLElement): void {
    if (this.browser) this.targets.update((t) => (t.includes(el) ? t : [...t, el]));
  }

  set(patch: Partial<Preset>): void {
    this._preset.update((p) => {
      const next = { ...p, ...patch };
      // Switching style brings its font along; leaving it drops that font again. An explicit font in the patch wins.
      if (patch.style && patch.style !== p.style && !patch.font) {
        const from = STYLE_FONTS[p.style as StyleName];
        const to = STYLE_FONTS[patch.style as StyleName];
        if (to) next.font = to;
        else if (from && p.font === from) next.font = DEFAULT_PRESET.font;
      }
      return next;
    });
  }

  /** A share code from the URL. Anything invalid or unknown gives the defaults. */
  load(code: string | null): void {
    const p = code ? decodePreset(code) : null;
    this._preset.set(p && valid(p) ? p : { ...DEFAULT_PRESET });
  }

  /** The default style is in the main CSS; the others are separate bundles (angular.json, inject: false). */
  private loadStyleSheet(style: string): void {
    if (style !== DEFAULT_STYLE) this.link(`docs-style-${style}`, `style-${style}.css`);
  }

  /** Loads every font's stylesheet, so a font list can show each name in its own face. Browser only, once. */
  preloadFonts(): void {
    if (!this.browser) return;
    for (const f of FONTS) this.link(`docs-font-${f.name}`, fontHref(f.dependency));
  }

  private link(id: string, href: string): void {
    if (this.doc.getElementById(id)) return;
    const link = this.doc.head.appendChild(this.doc.createElement('link'));
    link.id = id;
    link.rel = 'stylesheet';
    link.setAttribute('href', href);
  }
}
