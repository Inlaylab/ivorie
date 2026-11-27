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

export type ColorMode = 'light' | 'dark' | 'system';
/** Saved as JSON. Unknown keys (an old `style`) are kept as they are. */
export interface AppearanceState {
  mode: ColorMode;
  [key: string]: unknown;
}
export const APPEARANCE_KEY = 'ivorie-docs:appearance';

const MODES: readonly ColorMode[] = ['light', 'dark', 'system'];
/** With no saved choice the site follows the OS. */
const DEFAULTS: AppearanceState = { mode: 'system' };

function parse(raw: string | null): AppearanceState {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...DEFAULTS };
    const v = value as Record<string, unknown>;
    return { ...v, mode: MODES.includes(v['mode'] as ColorMode) ? (v['mode'] as ColorMode) : DEFAULTS.mode };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Light / dark / system on <html>. Browser only; the server renders light (index.html). The site has its own theme (generated/site-style.css, site-look.css). */
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
    // Another page of the site saved a choice (the playground's preview iframe follows its parent this way).
    const win = this.win;
    const onStorage = (e: StorageEvent) => {
      if (e.key === APPEARANCE_KEY) this._state.set(parse(e.newValue));
    };
    win.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => win.removeEventListener('storage', onStorage));
    effect(() => {
      const html = this.doc.documentElement;
      const dark = this.dark();
      html.classList.toggle('dark', dark);
      html.style.colorScheme = dark ? 'dark' : 'light';
    });
  }

  setMode(mode: ColorMode): void {
    this.update({ mode });
  }

  /** Light if dark is showing, else dark. Saved as an explicit choice. Cross-fades where the browser can,
   *  unless the person asked for reduced motion. */
  toggle(): void {
    const next = this.dark() ? 'light' : 'dark';
    const doc = this.doc as Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } };
    const reduce = this.win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!doc.startViewTransition || reduce) return this.setMode(next);
    const html = this.doc.documentElement;
    // The page itself fades only for this switch (styles.css: .docs-mode-fade); other transitions keep the root still.
    html.classList.add('docs-mode-fade');
    // The transition captures the new state right after this callback: flip the class here, not in the effect.
    const vt = doc.startViewTransition(() => {
      this.setMode(next);
      html.classList.toggle('dark', next === 'dark');
      html.style.colorScheme = next;
    });
    vt.finished.finally(() => html.classList.remove('docs-mode-fade'));
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
