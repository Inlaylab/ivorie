import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import PlaygroundPage from './playground';
import { PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';
import { DOCS_PRESET } from './playground-look';
import { THEMES, THEME_ORDER } from '../../generated/looks';
import { Appearance } from '../shell/appearance';

// The playground starts on the glass theme, which is also what `ivorie init` gives on its own.
const START = encodePreset(DOCS_PRESET);

@Component({ template: '' })
class Empty {}

async function render(url = '/playground') {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }),
  });
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'playground', component: PlaygroundPage },
        { path: '**', component: Empty },
      ]),
    ],
  });
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  const fixture = TestBed.createComponent(PlaygroundPage);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, fixture, router };
}

const rail = (el: HTMLElement) => el.querySelector('aside')!;
const stage = (el: HTMLElement) => el.querySelector<HTMLElement>('section[aria-label="Preview"]')!;
const frame = (el: HTMLElement) => stage(el).querySelector<HTMLIFrameElement>('iframe')!;
// The commands live in the Get code dialog, which renders in the overlay container.
async function openCode(el: HTMLElement, fixture: { whenStable(): Promise<unknown> }) {
  if (!document.querySelector('[data-testid="command"]')) {
    el.querySelector<HTMLElement>('[data-testid="get-code"]')!.click();
    await fixture.whenStable();
  }
}
const command = () => document.querySelector('[data-testid="command"]')!.textContent!.trim();
const existing = () => document.querySelector<HTMLInputElement>('input[name="code-target"][value="existing"]')!;

/** The theme tiles above the preview: pick by value. */
const tile = (el: HTMLElement, name: string) => el.querySelector<HTMLInputElement>(`input[name="pg-theme"][value="${name}"]`)!;
async function pickTheme(el: HTMLElement, fixture: { whenStable(): Promise<unknown> }, name: string) {
  tile(el, name).click();
  await fixture.whenStable();
}
const option = (label: string) => [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === label)!;
/** A color dropdown in the rail (accent, base, chart): open it, pick by label. */
async function pickColor(el: HTMLElement, fixture: { whenStable(): Promise<unknown> }, key: string, label: string) {
  el.querySelector<HTMLButtonElement>(`aside [data-testid="color-${key}"] [data-slot="select-trigger"]`)!.click();
  await fixture.whenStable();
  option(label).click();
  await fixture.whenStable();
}

describe('PlaygroundPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    localStorage.clear();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('the themes are tiles above the preview; the rail holds color, type and shape, dials; no "look" anywhere', async () => {
    const { el } = await render();
    expect(rail(el).querySelector('h1')!.textContent!.trim()).toBe('Customize');
    expect([...stage(el).querySelectorAll<HTMLInputElement>('input[name="pg-theme"]')].map((i) => i.value)).toEqual([...THEME_ORDER]);
    expect(rail(el).querySelector('[data-testid="theme-select"]')).toBeNull();
    const titles = [...rail(el).querySelectorAll('.docs-rail-title')].map((t) => t.textContent!.trim());
    expect(titles).toEqual(['Color', 'Type and shape', 'Dials']);
    expect([...rail(el).querySelectorAll('[data-dial]')].map((d) => d.getAttribute('data-dial'))).toEqual([
      'density', 'contrast', 'motion', 'panels', 'rim', 'shadow', 'blur', 'ambient',
    ]);
    expect(rail(el).textContent).not.toMatch(/\blooks?\b/i);
    expect(rail(el).querySelector('[data-testid="panel-command"]')!.textContent!.trim()).toBe('npx ivorie@1.6 init');
  });

  it('the control lists hold their sr-only inputs: positioned, so the page itself never scrolls', async () => {
    // sr-only is position: absolute. Without a positioned scroll body the inputs escape its clip
    // and stretch the page under the panes (1399px tall at a 910px window).
    const { el } = await render();
    expect(el.querySelector('[data-testid="controls-scroll"]')!.classList).toContain('relative');
  });

  it('tiles, swatches and segments change the preset; mode and width sit on the preview', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    const click = async (sel: string) => {
      el.querySelector<HTMLInputElement>(sel)!.click();
      await fixture.whenStable();
    };
    await pickTheme(el, fixture, 'bento');
    expect(look.preset()).toMatchObject({ theme: 'bento', accent: 'lime', font: 'outfit' });
    await pickColor(el, fixture, 'accent', 'Red');
    await pickColor(el, fixture, 'base', 'Olive');
    await click('input[name="rail-radius"][value="small"]');
    await click('input[name="rail-density"][value="compact"]');
    expect(look.preset()).toMatchObject({ theme: 'bento', accent: 'red', baseColor: 'olive', radius: 'small', density: 'compact' });
    expect(look.themeName()).toBe('bento');
    await click('input[name="pg-mode"][value="light"]');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    await click('input[name="pg-width"][value="mobile"]');
    fixture.detectChanges();
    expect(frame(el).style.width).toBe('390px');
  });

  it('the chrome is square and hairline: the panel and the code boxes, no shadows', async () => {
    const { el, fixture } = await render();
    expect(el.querySelector('aside[aria-labelledby="pg-title"]')!.className).not.toMatch(/rounded/);
    await openCode(el, fixture);
    const boxes = [...document.querySelectorAll('[data-testid="code-box"]')];
    expect(boxes.length).toBe(3);
    for (const b of boxes) {
      expect(b.classList).toContain('docs-pane');
      expect(b.className).not.toMatch(/rounded|bg-muted/);
    }
    expect(el.querySelector('[class*="shadow-"]:not(.docs-stage *)')).toBeNull();
  });

  it('the start theme is slate: the plain commands', async () => {
    const { el, fixture } = await render();
    await openCode(el, fixture);
    expect(command()).toBe('npx ivorie@1.6 init');
    existing().click();
    await fixture.whenStable();
    expect(command()).toBe('npx ivorie@1.6 apply default');
  });

  it('picking the slate theme disables the dials slate keeps fixed', async () => {
    const { el, fixture } = await render();
    await pickTheme(el, fixture, 'slate');
    fixture.detectChanges();
    const row = (dial: string) => rail(el).querySelector<HTMLFieldSetElement>(`[data-dial="${dial}"]`)!;
    for (const dial of ['panels', 'blur', 'ambient']) expect(row(dial).disabled).toBe(true);
    expect(row('blur').textContent).toContain('Slate keeps blur fixed');
    expect(row('rim').disabled).toBe(false);
  });

  it('a legacy theme in the URL loads: no tile is picked, its note shows', async () => {
    const code = encodePreset({ ...DEFAULT_PRESET, theme: 'maia' });
    const { el, fixture } = await render(`/playground?preset=${code}`);
    fixture.detectChanges();
    expect(stage(el).querySelector('input[name="pg-theme"]:checked')).toBeNull();
    expect(stage(el).querySelector('[data-testid="theme-note"]')!.textContent).toContain('Rounded, with generous spacing.');
  });

  it('picking Olive puts its code in the commands and the URL', async () => {
    const { el, fixture, router } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    fixture.detectChanges();
    const code = encodePreset({ ...DOCS_PRESET, baseColor: 'olive' });
    await openCode(el, fixture);
    expect(command()).toBe(`npx ivorie@1.6 init --theme ${code}`);
    expect(document.querySelector('[data-testid="preset-code"]')!.textContent!.trim()).toBe(code);
    existing().click();
    await fixture.whenStable();
    expect(command()).toBe(`npx ivorie@1.6 apply ${code}`);
    expect(router.url).toBe(`/playground?preset=${code}`);
  });

  it('a preset in the URL is applied; a bad one gives the defaults', async () => {
    const code = encodePreset({
      ...DEFAULT_PRESET,
      theme: 'nova',
      baseColor: 'olive',
      font: 'inter',
      fontHeading: 'lora',
      radius: 'large',
      iconLibrary: 'lucide',
    });
    const good = await render(`/playground?preset=${code}`);
    expect(good.fixture.debugElement.injector.get(PlaygroundLook).preset().baseColor).toBe('olive');
    TestBed.resetTestingModule();
    const bad = await render('/playground?preset=garbage');
    expect(bad.fixture.debugElement.injector.get(PlaygroundLook).code()).toBe(START);
  });

  it('the stage is an iframe on the preview route; the page keeps the site style', async () => {
    const { el, fixture } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    expect(frame(el).getAttribute('src')).toBe(
      'preview/scene/wall?preset=' + START,
    );
    expect(stage(el).style.getPropertyValue('--primary')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('Shuffle changes the look and the URL, and keeps the icon set', async () => {
    const { el, fixture, router } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    look.set({ iconLibrary: 'tabler' });
    const before = look.code();
    el.querySelector<HTMLElement>('[data-testid="shuffle"]')!.click();
    await fixture.whenStable();
    expect(look.code()).not.toBe(before);
    expect(look.preset().iconLibrary).toBe('tabler');
    expect(router.url).toBe(`/playground?preset=${look.code()}`);
  });

  it('a theme tile picks the theme and keeps your other choices out of it', async () => {
    const { el, fixture } = await render();
    expect(tile(el, 'slate').checked).toBe(true);
    await pickTheme(el, fixture, 'bento');
    expect(fixture.debugElement.injector.get(PlaygroundLook).themeName()).toBe('bento');
    expect(tile(el, 'bento').checked).toBe(true);
  });

  it('screen tabs switch the preview between the wall and real blocks', async () => {
    const { el, fixture } = await render();
    const tabs = [...stage(el).querySelectorAll<HTMLInputElement>('[role="radiogroup"][aria-label="Screen"] input')];
    expect(tabs.map((t) => t.value)).toEqual(['wall', 'dashboard-01', 'login-03', 'sidebar-07']);
    expect(frame(el).getAttribute('src')).toBe('preview/scene/wall?preset=' + START);
    tabs[1].click();
    await fixture.whenStable();
    expect(frame(el).getAttribute('src')).toBe('preview/block/dashboard-01?preset=' + START);
  });

  it('compare splits the preview: your look left, another theme right, a divider you can move by key', async () => {
    const { el, fixture } = await render();
    const toggle = stage(el).querySelector<HTMLButtonElement>('[data-testid="compare"]')!;
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    const frames = [...stage(el).querySelectorAll<HTMLIFrameElement>('iframe')];
    expect(frames.length).toBe(2);
    expect(frames[1].getAttribute('src')).toBe('preview/scene/wall?preset=' + encodePreset(THEMES.glass));
    const divider = stage(el).querySelector<HTMLElement>('[role="separator"]')!;
    expect(divider.getAttribute('aria-valuenow')).toBe('50');
    divider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();
    expect(divider.getAttribute('aria-valuenow')).toBe('45');
    expect(stage(el).querySelector<HTMLElement>('[data-testid="compare-frame"]')!.style.clipPath).toMatch(/^inset\(0(px)? 0(px)? 0(px)? 45%\)$/);
  });

  it('the rail lists what you changed from the theme, each with its own reset', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    expect(rail(el).querySelector('[data-testid="changed"]')).toBeNull();
    look.set({ accent: 'rose', radius: 'large' });
    await fixture.whenStable();
    const chips = [...rail(el).querySelectorAll<HTMLElement>('[data-testid="changed"] [data-field]')];
    expect(chips.map((c) => c.getAttribute('data-field'))).toEqual(['accent', 'radius']);
    expect(chips[0].textContent).toContain('Rose');
    chips[0].querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(look.preset().accent).toBe(THEMES.slate.accent);
    expect(look.preset().radius).toBe('large');
  });

  it('single keys: T next theme, D dark mode, S shuffle, ? lists them; never while typing', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    const appearance = fixture.debugElement.injector.get(Appearance);
    const key = (k: string, target: EventTarget = document.body) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    key('t');
    await fixture.whenStable();
    expect(look.themeName()).toBe(THEME_ORDER[1]);
    const dark = appearance.dark();
    key('d');
    expect(appearance.dark()).toBe(!dark);
    const before = look.code();
    key('s');
    expect(look.code()).not.toBe(before);
    const field = document.body.appendChild(document.createElement('input'));
    const now = look.code();
    key('s', field);
    expect(look.code()).toBe(now);
    field.remove();
    key('?');
    await fixture.whenStable();
    expect(document.querySelector('[data-testid="shortcuts"]')!.textContent).toContain('Next theme');
    expect(el).toBeTruthy();
  });

  it('accent, base and chart colors are picked the same way: a dropdown each, a color chip left of every item', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    for (const key of ['accent', 'base', 'chart']) {
      const trigger = el.querySelector<HTMLButtonElement>(`aside [data-testid="color-${key}"] [data-slot="select-trigger"]`)!;
      expect(trigger, key).not.toBeNull();
      expect(trigger.querySelector('.docs-color-chip'), key).not.toBeNull();
    }
    expect(rail(el).querySelector('.docs-swatch')).toBeNull();
    el.querySelector<HTMLButtonElement>('aside [data-testid="color-chart"] [data-slot="select-trigger"]')!.click();
    await fixture.whenStable();
    expect(option('Gray').querySelector('.docs-color-chip')).not.toBeNull();
    option('Gray').click();
    await fixture.whenStable();
    expect(look.preset().chartColor).toBe('base');
    // A color pick keeps the theme selected.
    expect(look.themeName()).toBe('slate');
    expect(tile(el, 'slate').checked).toBe(true);
  });

  it('the primary action copies the init command', async () => {
    const { el, fixture } = await render();
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => void (copied = t) } });
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    look.pickTheme('bento');
    await fixture.whenStable();
    const button = rail(el).querySelector<HTMLButtonElement>('[data-testid="copy-init"]')!;
    expect(button.textContent!.trim()).toBe('Copy init command');
    button.click();
    await fixture.whenStable();
    expect(copied).toBe(`npx ivorie@1.6 init --theme ${look.code()}`);
  });

  it('Copy link copies the page URL', async () => {
    const { el, fixture } = await render();
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t: string) => void (copied = t) } });
    el.querySelector<HTMLElement>('[data-testid="copy-link"]')!.click();
    await fixture.whenStable();
    expect(copied).toBe(location.href);
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});
