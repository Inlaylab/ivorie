import {
  DOCUMENT,
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DEFAULT_STYLE, STYLES, type StyleName } from './appearance-options';

export type ColorMode = 'light' | 'dark' | 'system';
/** Saved as JSON. Unknown keys are kept, so later presets can add fields. */
export interface AppearanceState {
  mode: ColorMode;
  style: StyleName;
  [key: string]: unknown;
}
export const APPEARANCE_KEY = 'ivorie-docs:appearance';

const MODES: readonly ColorMode[] = ['light', 'dark', 'system'];
const DEFAULTS: AppearanceState = { mode: 'system', style: DEFAULT_STYLE };

function parse(raw: string | null): AppearanceState {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULTS };
    const v = value as Record<string, unknown>;
    return {
      ...v,
      mode: MODES.includes(v['mode'] as ColorMode) ? (v['mode'] as ColorMode) : DEFAULTS.mode,
      style: STYLES.some((s) => s.name === v['style']) ? (v['style'] as StyleName) : DEFAULTS.style,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Light / dark / system and the style class. Browser only; the server renders the defaults. */
@Injectable({ providedIn: 'root' })
export class Appearance {
  private readonly doc = inject(DOCUMENT);
  private readonly win = isPlatformBrowser(inject(PLATFORM_ID)) ? this.doc.defaultView : null;
  private readonly _state = signal<AppearanceState>(this.read());
  private readonly prefersDark = signal(false);

  readonly state = this._state.asReadonly();
  readonly dark = computed(() => {
    const mode = this._state().mode;
    return mode === 'dark' || (mode === 'system' && this.prefersDark());
  });

  constructor() {
    if (!this.win) return;
    const query = this.win.matchMedia?.('(prefers-color-scheme: dark)');
    if (query) {
      this.prefersDark.set(query.matches);
      const onChange = (e: { matches: boolean }) => this.prefersDark.set(e.matches);
      query.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => query.removeEventListener('change', onChange));
    }
    effect(() => {
      const html = this.doc.documentElement;
      const dark = this.dark();
      html.classList.toggle('dark', dark);
      html.style.colorScheme = dark ? 'dark' : 'light';
    });
    effect(() => {
      const body = this.doc.body;
      const style = `style-${this._state().style}`;
      for (const c of [...body.classList]) if (c.startsWith('style-') && c !== style) body.classList.remove(c);
      body.classList.add(style);
      this.loadStyleSheet(this._state().style);
    });
  }

  setMode(mode: ColorMode): void {
    this.update({ mode });
  }

  setStyle(style: StyleName): void {
    this.update({ style });
  }

  /** The default style is in the main CSS; the others are separate bundles (angular.json, inject: false). */
  private loadStyleSheet(style: StyleName): void {
    const current = this.doc.head.querySelector<HTMLLinkElement>('link#docs-style');
    if (style === DEFAULT_STYLE) {
      current?.remove();
      return;
    }
    const link = current ?? this.doc.head.appendChild(this.doc.createElement('link'));
    link.id = 'docs-style';
    link.rel = 'stylesheet';
    link.setAttribute('href', `style-${style}.css`);
  }

  private update(patch: Partial<AppearanceState>): void {
    this._state.update((s) => ({ ...s, ...patch }));
    try {
      this.win?.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(this._state()));
    } catch {
      // Storage blocked: the choice lasts for this page only.
    }
  }

  private read(): AppearanceState {
    try {
      return this.win ? parse(this.win.localStorage.getItem(APPEARANCE_KEY)) : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }
}
