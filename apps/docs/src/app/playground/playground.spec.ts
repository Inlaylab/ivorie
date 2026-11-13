import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import PlaygroundPage from './playground';
import { PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';
import { STYLES } from '../shell/appearance-options';

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

describe('PlaygroundPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    localStorage.clear();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('the panel has one row per axis, label over value', async () => {
    const { el } = await render();
    expect(rail(el).querySelector('h1')!.textContent!.trim()).toBe('Customize');
    const rows = [...rail(el).querySelectorAll('span[id$="-label"]')].map((s) => s.textContent!.trim());
    expect(rows).toEqual(['Mode', 'Style', 'Base color', 'Accent', 'Chart color', 'Menu accent', 'Radius', 'Icons', 'Heading font', 'Font']);
    expect(rail(el).querySelectorAll('[data-slot="select-trigger"]').length).toBe(10);
    expect(rail(el).querySelector('[data-testid="panel-command"]')!.textContent!.trim()).toBe('npx ivorie init');
  });

  it('rows change the look and the mode; the width sits on the preview; style options explain themselves', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    const open = async (label: string) => {
      rail(el).querySelector<HTMLElement>(`[aria-labelledby="rail-${label}-label"]`)!.click();
      await fixture.whenStable();
    };
    const pick = async (label: string, text: string) => {
      await open(label);
      [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === text)!.click();
      await fixture.whenStable();
    };
    await open('style');
    expect(document.querySelectorAll('[role="option"] iv-tooltip').length).toBe(STYLES.length);
    [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === 'Glass')!.click();
    await fixture.whenStable();
    await pick('radius', 'Large');
    await pick('iconLibrary', 'Phosphor');
    expect(look.preset()).toMatchObject({ style: 'glass', radius: 'large', iconLibrary: 'phosphor' });
    await pick('mode', 'Light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    stage(el).querySelector<HTMLInputElement>('input[name="pg-width"][value="mobile"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(frame(el).style.width).toBe('390px');
  });

  it('the default look gives the plain commands', async () => {
    const { el, fixture } = await render();
    await openCode(el, fixture);
    expect(command()).toBe('npx ivorie init');
    existing().click();
    await fixture.whenStable();
    expect(command()).toBe('npx ivorie apply default');
  });

  it('picking Olive puts its code in the commands and the URL', async () => {
    const { el, fixture, router } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    fixture.detectChanges();
    const code = encodePreset({
      ...DEFAULT_PRESET,
      style: 'nova',
      baseColor: 'olive',
      font: 'system',
      fontHeading: 'inherit',
      radius: 'default',
      iconLibrary: 'lucide',
    });
    await openCode(el, fixture);
    expect(command()).toBe(`npx ivorie init --preset ${code}`);
    expect(document.querySelector('[data-testid="preset-code"]')!.textContent!.trim()).toBe(code);
    existing().click();
    await fixture.whenStable();
    expect(command()).toBe(`npx ivorie apply ${code}`);
    expect(router.url).toBe(`/playground?preset=${code}`);
  });

  it('a preset in the URL is applied; a bad one gives the defaults', async () => {
    const code = encodePreset({
      ...DEFAULT_PRESET,
      style: 'nova',
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
    expect(bad.fixture.debugElement.injector.get(PlaygroundLook).code()).toBe(encodePreset({ ...DEFAULT_PRESET }));
  });

  it('the stage is an iframe on the preview route; the page keeps nova', async () => {
    const { el, fixture } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    expect(frame(el).getAttribute('src')).toBe(
      'preview/scene/wall?preset=' + encodePreset({ ...DEFAULT_PRESET }),
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
