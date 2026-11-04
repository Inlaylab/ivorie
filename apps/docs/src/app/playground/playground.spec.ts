import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import PlaygroundPage, { SCENES } from './playground';
import { PlaygroundLook } from './playground-look';
import { encodePreset } from './preset-code';

@Component({ template: '' })
class Empty {}

async function render(url = '/playground') {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: 'playground', component: PlaygroundPage }, { path: '**', component: Empty }])],
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
const command = (el: HTMLElement) => el.querySelector('[data-testid="command"]')!.textContent!.trim();
const existing = (el: HTMLElement) => el.querySelector<HTMLInputElement>('input[name="rail-target"][value="existing"]')!;

describe('PlaygroundPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    localStorage.clear();
  });

  it('the rail has no visible title and shows every look axis as a dropdown', async () => {
    const { el } = await render();
    expect(rail(el).querySelector('h1')!.classList).toContain('sr-only');
    expect(rail(el).querySelectorAll('docs-look-controls legend').length).toBe(0);
    const dropdowns = [...rail(el).querySelectorAll('docs-look-controls span[id$="-label"]')].map((s) => s.textContent!.trim());
    expect(dropdowns).toEqual(['Style', 'Base color', 'Radius', 'Icons', 'Font', 'Heading font']);
    expect(rail(el).querySelectorAll('docs-look-controls [data-slot="select-trigger"]').length).toBe(6);
  });

  it('picking style, radius and icons from the dropdowns changes the look', async () => {
    const { el, fixture } = await render();
    const look = fixture.debugElement.injector.get(PlaygroundLook);
    const pick = async (label: string, text: string) => {
      rail(el).querySelector<HTMLElement>(`[aria-labelledby="rail-${label}-label"]`)!.click();
      await fixture.whenStable();
      [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === text)!.click();
      await fixture.whenStable();
    };
    await pick('style', 'Nova');
    await pick('radius', 'Large');
    await pick('iconLibrary', 'Phosphor');
    expect(look.preset()).toMatchObject({ style: 'nova', radius: 'large', iconLibrary: 'phosphor' });
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
    const code = encodePreset({ style: 'nova', baseColor: 'olive', font: 'system', fontHeading: 'inherit', radius: 'default', iconLibrary: 'lucide' });
    expect(command(el)).toBe(`npx ivorie init --preset ${code}`);
    existing(el).click();
    fixture.detectChanges();
    expect(command(el)).toBe(`npx ivorie apply ${code}`);
    expect(router.url).toBe(`/playground?preset=${code}`);
  });

  it('a preset in the URL is applied; a bad one gives the defaults', async () => {
    const code = encodePreset({ style: 'nova', baseColor: 'olive', font: 'inter', fontHeading: 'lora', radius: 'large', iconLibrary: 'lucide' });
    const good = await render(`/playground?preset=${code}`);
    expect(good.fixture.debugElement.injector.get(PlaygroundLook).preset().baseColor).toBe('olive');
    TestBed.resetTestingModule();
    const bad = await render('/playground?preset=garbage');
    expect(command(bad.el)).toBe('npx ivorie init');
  });

  it('the look is on the preview stage, not on the page', async () => {
    const { el, fixture } = await render();
    fixture.debugElement.injector.get(PlaygroundLook).set({ baseColor: 'olive' });
    await fixture.whenStable();
    expect(el.querySelector<HTMLElement>('.docs-stage')!.style.getPropertyValue('--primary')).not.toBe('');
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('');
  });

  it('every scene renders when picked, with its description, and goes in the URL', async () => {
    const { el, fixture, router } = await render();
    for (const s of SCENES) {
      el.querySelector<HTMLInputElement>(`input[name="scene"][value="${s.value}"]`)!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      const tag = s.value === 'dashboard' ? 'docs-playground-preview' : `docs-scene-${s.value}`;
      expect(el.querySelector(`.docs-stage ${tag}`), s.value).not.toBeNull();
      expect(el.querySelector('[data-testid="scene-description"]')!.textContent!.trim()).toBe(s.description);
    }
    expect(router.url).toBe('/playground?scene=checkout');
  });

  it('a scene in the URL is opened; an unknown one gives the dashboard', async () => {
    const good = await render('/playground?scene=team');
    expect(good.el.querySelector('.docs-stage docs-scene-team')).not.toBeNull();
    TestBed.resetTestingModule();
    const bad = await render('/playground?scene=nope');
    expect(bad.el.querySelector('.docs-stage docs-playground-preview')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});
