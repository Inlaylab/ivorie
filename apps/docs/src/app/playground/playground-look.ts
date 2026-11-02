import { DOCUMENT, DestroyRef, Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BASE_COLORS, FONTS, RADII } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { STYLES, type StyleName } from '../shell/appearance-options';
import { DEFAULT_PRESET, decodePreset, encodePreset, type Preset } from './preset-code';

/** Tailwind's default sans stack: what `font: system` gives an app. */
const SYSTEM_SANS = "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";
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
    p.radius in RADII
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
 * Playground state. Provided by the playground page: while it lives, the preset is applied to the
 * whole document (so overlays get it too); on destroy every change is undone.
 */
@Injectable()
export class PlaygroundLook {
  private readonly doc = inject(DOCUMENT);
  private readonly appearance = inject(Appearance);
  private readonly _preset = signal<Preset>({ ...DEFAULT_PRESET });

  readonly preset = this._preset.asReadonly();
  readonly code = computed(() => encodePreset(this._preset()));
  readonly css = computed(() => themeCss(this._preset()));

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const html = this.doc.documentElement;
    const applied = new Set<string>();
    effect(() => {
      const p = this._preset();
      const color = BASE_COLORS.find((c) => c.name === p.baseColor)!;
      const vars: Record<string, string> = {
        ...(this.appearance.dark() ? color.dark : color.light),
        '--radius': RADII[p.radius] ?? color.light['--radius'],
        '--font-sans': p.font === 'system' ? SYSTEM_SANS : `${family(p.font)}, ${SYSTEM_SANS}`,
        '--font-heading': p.fontHeading === 'inherit' ? 'var(--font-sans)' : family(p.fontHeading),
      };
      for (const [k, v] of Object.entries(vars)) {
        html.style.setProperty(k, v);
        applied.add(k);
      }
      for (const name of [p.font, p.fontHeading]) {
        const font = FONTS.find((f) => f.name === name);
        if (font && !this.doc.getElementById(`docs-font-${font.name}`)) {
          // A failed load (offline, blocked CDN) leaves the fallback stack; nothing to handle.
          const link = this.doc.head.appendChild(this.doc.createElement('link'));
          link.id = `docs-font-${font.name}`;
          link.rel = 'stylesheet';
          link.setAttribute('href', fontHref(font.dependency));
        }
      }
      this.appearance.previewStyle(p.style as StyleName);
    });
    inject(DestroyRef).onDestroy(() => {
      for (const k of applied) html.style.removeProperty(k);
      this.doc.head.querySelectorAll('link[id^="docs-font-"]').forEach((l) => l.remove());
      this.appearance.previewStyle(null);
    });
  }

  set(patch: Partial<Preset>): void {
    this._preset.update((p) => ({ ...p, ...patch }));
  }

  /** A share code from the URL. Anything invalid or unknown gives the defaults. */
  load(code: string | null): void {
    const p = code ? decodePreset(code) : null;
    this._preset.set(p && valid(p) ? p : { ...DEFAULT_PRESET });
  }
}
