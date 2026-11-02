import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { BASE_COLORS } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, encodePreset } from './preset-code';

const olive = BASE_COLORS.find((c) => c.name === 'olive')!;
const html = () => document.documentElement;
const inlineVars = () => [...html().style].filter((p) => p.startsWith('--'));

function create() {
  Object.defineProperty(document.defaultView!, 'matchMedia', {
    configurable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  });
  TestBed.configureTestingModule({ providers: [PlaygroundLook] });
  const look = TestBed.inject(PlaygroundLook);
  TestBed.tick();
  return { look, appearance: TestBed.inject(Appearance) };
}

describe('PlaygroundLook', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    html().className = '';
    html().removeAttribute('style');
    document.body.className = '';
    document.head.querySelectorAll('link').forEach((l) => l.remove());
  });

  it('applies the base color for light, then dark', () => {
    const { look, appearance } = create();
    look.set({ baseColor: 'olive' });
    TestBed.tick();
    expect(html().style.getPropertyValue('--primary')).toBe(olive.light['--primary']);
    appearance.setMode('dark');
    TestBed.tick();
    expect(html().style.getPropertyValue('--primary')).toBe(olive.dark['--primary']);
  });

  it('sets --radius from the radius name', () => {
    const { look } = create();
    look.set({ radius: 'large' });
    TestBed.tick();
    expect(html().style.getPropertyValue('--radius')).toBe('0.875rem');
  });

  it('loads a font once from @fontsource-variable and sets the tokens', () => {
    const { look } = create();
    look.set({ font: 'inter', fontHeading: 'lora' });
    TestBed.tick();
    look.set({ radius: 'small' });
    TestBed.tick();
    const links = document.head.querySelectorAll<HTMLLinkElement>('link[id^="docs-font-"]');
    expect([...links].map((l) => l.getAttribute('href'))).toEqual([
      'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/index.css',
      'https://cdn.jsdelivr.net/npm/@fontsource-variable/lora/index.css',
    ]);
    expect(html().style.getPropertyValue('--font-sans')).toContain("'Inter Variable'");
    expect(html().style.getPropertyValue('--font-heading')).toContain("'Lora Variable'");
    expect(() => links[0].dispatchEvent(new Event('error'))).not.toThrow();
  });

  it('previews the style on <body> without saving it', () => {
    const { look, appearance } = create();
    look.set({ style: 'nova' });
    TestBed.tick();
    expect(document.body.classList).toContain('style-nova');
    expect(appearance.state().style).toBe('maia');
    expect(localStorage.getItem('ivorie-docs:appearance')).toBeNull();
  });

  it('cleans up on destroy: no vars, no font links, saved style back', () => {
    const { look } = create();
    look.set({ baseColor: 'olive', font: 'inter', style: 'nova', radius: 'large' });
    TestBed.tick();
    TestBed.resetTestingModule();
    expect(inlineVars()).toEqual([]);
    expect(document.head.querySelector('link[id^="docs-font-"]')).toBeNull();
  });

  it('load(): a valid code, a bad code, an unknown value', () => {
    const { look } = create();
    const golden = { style: 'nova', baseColor: 'olive', font: 'inter', fontHeading: 'lora', radius: 'large' };
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

  it('does nothing on the server', () => {
    TestBed.configureTestingModule({ providers: [PlaygroundLook, { provide: PLATFORM_ID, useValue: 'server' }] });
    const look = TestBed.inject(PlaygroundLook);
    look.set({ baseColor: 'olive' });
    TestBed.tick();
    expect(inlineVars()).toEqual([]);
  });
});
