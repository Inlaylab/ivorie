import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import PlaygroundPage from './playground';
import { SCENES } from './scenes';
import { PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';
import { STYLES } from '../shell/appearance-options';

@Component({ template: '' })
class Empty {}

async function render(url = '/playground') {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
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
const frame = (el: HTMLElement) => el.querySelector<HTMLIFrameElement>('.docs-stage iframe')!;
const command = (el: HTMLElement) =>
  el.querySelector('[data-testid="command"]')!.textContent!.trim();
const existing = (el: HTMLElement) =>
  el.querySelector<HTMLInputElement>('input[name="rail-target"][value="existing"]')!;

describe('PlaygroundPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    localStorage.clear();
  });

  it('the rail has no visible title, a style gallery and every other look axis as a dropdown', async () => {
    const { el } = await render();
    expect(rail(el).querySelector('h1')!.classList).toContain('sr-only');
    expect(
      [...rail(el).querySelectorAll('docs-look-controls legend')].map((l) => l.textContent!.trim()),
    ).toEqual(['Style']);
    const tiles = [...rail(el).querySelectorAll<HTMLInputElement>('input[name="rail-style"]')].map(
      (i) => i.value,
    );
    expect(tiles).toEqual(STYLES.map((s) => s.name));
    const dropdowns = [...rail(el).querySelectorAll('docs-look-controls span[id$="-label"]')].map(
      (s) => s.textContent!.trim(),
    );
    expect(dropdowns).toEqual(['Base color', 'Radius', 'Icons', 'Font', 'Heading font']);
    expect(
      rail(el).querySelectorAll('docs-look-controls [data-slot="select-trigger"]').length,
    ).toBe(5);
  });

  it('picking a style tile changes the look and the note', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    rail(el).querySelector<HTMLInputElement>('input[name="rail-style"][value="glass"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(look.preset().style).toBe('glass');
    expect(
      rail(el).querySelector<HTMLInputElement>('input[name="rail-style"][value="glass"]')!.checked,
    ).toBe(true);
    expect(rail(el).querySelector('[data-testid="style-note"]')!.textContent!.trim()).toBe(
      'Frosted, see-through surfaces.',
    );
  });

  it('picking radius and icons from the dropdowns changes the look', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    const pick = async (label: string, text: string) => {
      rail(el).querySelector<HTMLElement>(`[aria-labelledby="rail-${label}-label"]`)!.click();
      await fixture.whenStable();
      [...document.querySelectorAll<HTMLElement>('[role="option"]')]
        .find((o) => o.textContent!.trim() === text)!
        .click();
      await fixture.whenStable();
    };
    await pick('radius', 'Large');
    await pick('iconLibrary', 'Phosphor');
    expect(look.preset()).toMatchObject({ radius: 'large', iconLibrary: 'phosphor' });
  });

  it('the default look gives the plain commands', async () => {
    const { el, fixture } = await render();
    expect(command(el)).toBe('npx ivorie init');
    existing(el).click();
    fixture.detectChanges();
    expect(command(el)).toBe('npx ivorie apply default');
  });

  it('picking Olive puts its code in the commands and the URL', async () => {
    const { el, fixture, router } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    fixture.detectChanges();
    const code = encodePreset({
      style: 'nova',
      baseColor: 'olive',
      font: 'system',
      fontHeading: 'inherit',
      radius: 'default',
      iconLibrary: 'lucide',
    });
    expect(command(el)).toBe(`npx ivorie init --preset ${code}`);
    existing(el).click();
    fixture.detectChanges();
    expect(command(el)).toBe(`npx ivorie apply ${code}`);
    expect(router.url).toBe(`/playground?preset=${code}`);
  });

  it('a preset in the URL is applied; a bad one gives the defaults', async () => {
    const code = encodePreset({
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
    expect(command(bad.el)).toBe('npx ivorie init');
  });

  it('the stage is an iframe on the preview route; the page keeps nova', async () => {
    const { el, fixture } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    expect(frame(el).getAttribute('src')).toBe(
      'preview/scene/dashboard?preset=' + encodePreset({ ...DEFAULT_PRESET }),
    );
    expect(el.querySelector<HTMLElement>('.docs-stage')!.style.getPropertyValue('--primary')).toBe(
      '',
    );
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('picking a scene changes the iframe path, the description and the URL', async () => {
    const { el, fixture, router } = await render();
    for (const s of SCENES) {
      el.querySelector<HTMLInputElement>(`input[name="scene"][value="${s.value}"]`)!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(frame(el).getAttribute('src'), s.value).toMatch(
        new RegExp(String.raw`^preview/scene/${s.value}\?preset=`),
      );
      expect(el.querySelector('[data-testid="scene-description"]')!.textContent!.trim()).toBe(
        s.description,
      );
    }
    expect(router.url).toBe('/playground?scene=checkout');
  });

  it('a preset and scene in the URL reach the iframe', async () => {
    const code = encodePreset({ ...DEFAULT_PRESET, baseColor: 'olive' });
    const { el } = await render(`/playground?preset=${code}&scene=team`);
    expect(frame(el).getAttribute('src')).toBe(`preview/scene/team?preset=${code}`);
  });

  it('an unknown scene in the URL gives the dashboard', async () => {
    const { el } = await render('/playground?scene=nope');
    expect(frame(el).getAttribute('src')).toMatch(/^preview\/scene\/dashboard\?/);
  });

  it('the width toggle sets the frame width', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLInputElement>('input[name="width"][value="mobile"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(frame(el).style.width).toBe('390px');
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});
