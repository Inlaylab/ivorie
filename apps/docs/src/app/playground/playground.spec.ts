import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import PlaygroundPage from './playground';
import { PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';
import { DOCS_PRESET } from './playground-look';
import { THEME_ORDER } from '../../generated/looks';

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

/** The rail's theme dropdown: open it, pick by value. */
const themeTrigger = (el: HTMLElement) => el.querySelector<HTMLButtonElement>('aside [data-testid="theme-select"] [data-slot="select-trigger"]')!;
async function pickRailTheme(el: HTMLElement, fixture: { whenStable(): Promise<unknown> }, name: string) {
  themeTrigger(el).click();
  await fixture.whenStable();
  option(name[0].toUpperCase() + name.slice(1)).click();
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
const themeOptions = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')].map((o) => o.textContent!.trim());

describe('PlaygroundPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    localStorage.clear();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('the rail: theme first, then color, type and shape, dials last; no "look" anywhere', async () => {
    const { el } = await render();
    expect(rail(el).querySelector('h1')!.textContent!.trim()).toBe('Customize');
    themeTrigger(el).click();
    await new Promise((r) => setTimeout(r));
    expect(themeOptions()).toEqual(['Slate', 'Glass', 'Bento', 'Midnight', 'Clay', 'Mono', 'Tint', 'Nova', 'Luma', 'Mira', 'Sera']);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const titles = [...rail(el).querySelectorAll('.docs-rail-title')].map((t) => t.textContent!.trim());
    expect(titles).toEqual(['Theme', 'Color', 'Type and shape', 'Dials']);
    expect([...rail(el).querySelectorAll('[data-dial]')].map((d) => d.getAttribute('data-dial'))).toEqual([
      'density', 'contrast', 'motion', 'panels', 'rim', 'shadow', 'blur', 'ambient',
    ]);
    expect(rail(el).textContent).not.toMatch(/\blooks?\b/i);
    expect(rail(el).querySelector('[data-testid="panel-command"]')!.textContent!.trim()).toBe('npx ivorie@1.6 init');
  });

  it('tiles, swatches and segments change the preset; mode and width sit on the preview', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    const click = async (sel: string) => {
      el.querySelector<HTMLInputElement>(sel)!.click();
      await fixture.whenStable();
    };
    await pickRailTheme(el, fixture, 'bento');
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
    await pickRailTheme(el, fixture, 'slate');
    fixture.detectChanges();
    const row = (dial: string) => rail(el).querySelector<HTMLFieldSetElement>(`[data-dial="${dial}"]`)!;
    for (const dial of ['panels', 'blur', 'ambient']) expect(row(dial).disabled).toBe(true);
    expect(row('blur').textContent).toContain('Slate keeps blur fixed');
    expect(row('rim').disabled).toBe(false);
  });

  it('a legacy theme in the URL loads: the dropdown names it, its note shows', async () => {
    const code = encodePreset({ ...DEFAULT_PRESET, theme: 'maia' });
    const { el, fixture } = await render(`/playground?preset=${code}`);
    fixture.detectChanges();
    expect(themeTrigger(el).textContent).not.toContain('Slate');
    expect(rail(el).querySelector('[data-testid="theme-note"]')!.textContent).toContain('Rounded, with generous spacing.');
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

  it('the rail picks a theme from one dropdown: the trigger names the theme, items show dots and a word', async () => {
    const { el, fixture } = await render();
    expect(themeTrigger(el).textContent!.trim()).toBe('Slate');
    themeTrigger(el).click();
    await fixture.whenStable();
    const item = option('Bento');
    expect(item.querySelectorAll('.docs-theme-dot').length).toBe(3);
    expect(item.querySelector('.docs-glyph')!.getAttribute('data-glyph')).toBe('Tiles');
    expect(rail(el).querySelector('[data-testid="theme-row"], [data-testid="theme-preview"]')).toBeNull();
    item.click();
    await fixture.whenStable();
    expect(themeTrigger(el).textContent!.trim()).toBe('Bento');
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
    expect(themeTrigger(el).textContent!.trim()).toBe('Slate');
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
