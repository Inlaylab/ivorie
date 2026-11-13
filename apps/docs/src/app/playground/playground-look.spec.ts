import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { BASE_COLORS } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { IV_ICONS } from '@inlaylab/ivorie/icon';
import { COMPONENT_ICONS as TABLER } from '@inlaylab/ivorie/icons/tabler';
import { PREVIEW_ICONS, PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';

const olive = BASE_COLORS.find((c) => c.name === 'olive')!;
const html = () => document.documentElement;
const inlineVars = (el: HTMLElement) => [...el.style].filter((p) => p.startsWith('--'));

function create(providers: unknown[] = []) {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }),
  });
  TestBed.configureTestingModule({ providers: [PlaygroundLook, ...(providers as never[])] });
  const look = TestBed.inject(PlaygroundLook);
  const stage = document.body.appendChild(document.createElement('div'));
  look.attach(stage);
  TestBed.tick();
  return { look, stage, appearance: TestBed.inject(Appearance) };
}

describe('PlaygroundLook', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    html().className = '';
    html().removeAttribute('style');
    document.body.className = '';
    document.body.innerHTML = '';
    document.head.querySelectorAll('link').forEach((l) => l.remove());
  });

  it('applies the base color to the attached element only, for light then dark', () => {
    const { look, stage, appearance } = create();
    appearance.setMode('light');
    look.set({ baseColor: 'olive' });
    TestBed.tick();
    expect(stage.style.getPropertyValue('--primary')).toBe(olive.light['--primary']);
    expect(inlineVars(html())).toEqual([]);
    appearance.setMode('dark');
    TestBed.tick();
    expect(stage.style.getPropertyValue('--primary')).toBe(olive.dark['--primary']);
  });

  it('sets --radius from the radius name', () => {
    const { look, stage } = create();
    look.set({ radius: 'large' });
    TestBed.tick();
    expect(stage.style.getPropertyValue('--radius')).toBe('0.875rem');
  });

  it('loads a font once from @fontsource-variable and sets the tokens', () => {
    const { look, stage } = create();
    look.set({ font: 'inter', fontHeading: 'lora' });
    TestBed.tick();
    look.set({ radius: 'small' });
    TestBed.tick();
    const links = document.head.querySelectorAll<HTMLLinkElement>('link[id^="docs-font-"]');
    expect([...links].map((l) => l.getAttribute('href'))).toEqual([
      'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/index.css',
      'https://cdn.jsdelivr.net/npm/@fontsource-variable/lora/index.css',
    ]);
    expect(stage.style.getPropertyValue('--font-sans')).toContain("'Inter Variable'");
    expect(stage.style.getPropertyValue('--font-heading')).toContain("'Lora Variable'");
    expect(() => links[0].dispatchEvent(new Event('error'))).not.toThrow();
  });

  it('puts the style class on the element and loads its sheet; <body> keeps nova', () => {
    document.body.className = 'style-nova';
    const { look, stage } = create();
    look.set({ style: 'maia' });
    TestBed.tick();
    expect([...stage.classList].sort()).toEqual(['docs-preview', 'style-maia']);
    expect(document.body.className).toBe('style-nova');
    expect(document.getElementById('docs-style-maia')?.getAttribute('href')).toBe('style-maia.css');
  });

  it('cleans up on destroy: no vars, no style class, no links', () => {
    const { look, stage } = create();
    look.set({ baseColor: 'olive', font: 'inter', style: 'nova', radius: 'large' });
    TestBed.tick();
    TestBed.resetTestingModule();
    expect(inlineVars(stage)).toEqual([]);
    expect(stage.className).toBe('');
    expect(document.head.querySelector('link[id^="docs-font-"], link[id^="docs-style-"]')).toBeNull();
  });

  it('load(): a valid code, a bad code, an unknown value', () => {
    const { look } = create();
    const golden = { ...DEFAULT_PRESET, style: 'nova', baseColor: 'olive', font: 'inter', fontHeading: 'lora', radius: 'large', theme: 'blue', chartColor: 'rose', menuAccent: 'bold' };
    look.load(encodePreset(golden));
    expect(look.preset()).toEqual(golden);
    look.load('ivp1_!!');
    expect(look.preset()).toEqual(DEFAULT_PRESET);
    look.load(encodePreset({ ...golden, baseColor: 'slate' }));
    expect(look.preset()).toEqual(DEFAULT_PRESET);
    look.load(null);
    expect(look.preset()).toEqual(DEFAULT_PRESET);
  });

  it('code and css follow the preset', () => {
    const { look } = create();
    expect(look.code()).toBe(encodePreset(DEFAULT_PRESET));
    look.set({ baseColor: 'olive', radius: 'large', font: 'inter' });
    expect(look.css()).toContain(`:root {\n  --background: ${olive.light['--background']};`);
    expect(look.css()).toContain('  --radius: 0.875rem;');
    expect(look.css()).toContain(`.dark {\n  --background: ${olive.dark['--background']};`);
    expect(look.css()).toContain("@theme {\n  --font-sans: 'Inter Variable', sans-serif;\n}");
  });

  it('switching to mono picks its font and keeps the radius; leaving it drops that font', () => {
    const { look, stage } = create();
    look.set({ radius: 'large' });
    look.set({ style: 'mono' });
    TestBed.tick();
    expect(look.preset()).toMatchObject({ style: 'mono', font: 'geist-mono', radius: 'large' });
    expect(stage.style.getPropertyValue('--radius')).toBe('0.875rem');
    expect(stage.style.getPropertyValue('--font-sans')).toContain("'Geist Mono Variable'");
    look.set({ style: 'nova' });
    expect(look.preset().font).toBe('system');
    look.set({ style: 'mono' });
    look.set({ font: 'inter' });
    look.set({ style: 'nova' });
    expect(look.preset().font).toBe('inter');
  });

  it('does nothing on the server', () => {
    const { look, stage } = create([{ provide: PLATFORM_ID, useValue: 'server' }]);
    look.set({ baseColor: 'olive' });
    TestBed.tick();
    expect(inlineVars(stage)).toEqual([]);
  });

  it('PREVIEW_ICONS follows the picked icon library; unknown libraries load as defaults', () => {
    const { look } = create([PREVIEW_ICONS]);
    const icons = TestBed.inject(IV_ICONS);
    expect(icons.check).not.toBe(TABLER.check);
    look.set({ iconLibrary: 'tabler' });
    expect(icons.check).toBe(TABLER.check);
    look.load(encodePreset({ ...DEFAULT_PRESET, iconLibrary: 'feather' }));
    expect(look.preset().iconLibrary).toBe('lucide');
  });
});
