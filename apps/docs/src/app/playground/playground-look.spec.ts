import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { BASE_COLORS, THEMES } from '../../generated/looks';
import { Appearance } from '../shell/appearance';
import { IV_ICONS } from '@inlaylab/ivorie/icon';
import { COMPONENT_ICONS as TABLER } from '@inlaylab/ivorie/icons/tabler';
import { DOCS_PRESET, PREVIEW_ICONS, PlaygroundLook } from './playground-look';
import { DEFAULT_PRESET, FILL_PRESET, encodePreset } from './preset-code';

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
    look.set({ baseColor: 'olive', accent: 'base' });
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

  it('self-hosted fonts (geist, geist-mono) add no CDN link', () => {
    const { look } = create();
    look.set({ font: 'geist-mono', fontHeading: 'geist' });
    TestBed.tick();
    expect(document.head.querySelector('link[id^="docs-font-"]')).toBeNull();
  });

  it('loads a font once from @fontsource-variable and sets the tokens', () => {
    const { look, stage } = create();
    look.set({ font: 'inter', fontHeading: 'lora' });
    TestBed.tick();
    look.set({ radius: 'small' });
    TestBed.tick();
    const links = document.head.querySelectorAll<HTMLLinkElement>('link[id^="docs-font-"]');
    // geist (the default font) is self-hosted by styles.css: no CDN link.
    expect([...links].map((l) => l.getAttribute('href'))).toEqual([
      'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/index.css',
      'https://cdn.jsdelivr.net/npm/@fontsource-variable/lora/index.css',
    ]);
    expect(stage.style.getPropertyValue('--font-sans')).toContain("'Inter Variable'");
    expect(stage.style.getPropertyValue('--font-heading')).toContain("'Lora Variable'");
    expect(() => links[0].dispatchEvent(new Event('error'))).not.toThrow();
  });

  it('puts the style class on the element and loads its sheet; <body> keeps nova', () => {
    document.body.className = 'theme-nova';
    const { look, stage } = create();
    look.set({ theme: 'maia' });
    TestBed.tick();
    expect([...stage.classList].sort()).toEqual(['docs-other', 'docs-preview', 'theme-maia']);
    expect(document.body.className).toBe('theme-nova');
    expect(document.getElementById('docs-theme-maia')?.getAttribute('href')).toBe('theme-maia.css');
  });

  it('cleans up on destroy: no vars, no style class, no links', () => {
    const { look, stage } = create();
    look.set({ baseColor: 'olive', font: 'inter', theme: 'nova', radius: 'large' });
    TestBed.tick();
    TestBed.resetTestingModule();
    expect(inlineVars(stage)).toEqual([]);
    expect(stage.className).toBe('');
    expect(document.head.querySelector('link[id^="docs-font-"], link[id^="docs-theme-"]')).toBeNull();
  });

  it('load(): a valid code, a bad code, an unknown value', () => {
    const { look } = create();
    const golden = { ...DEFAULT_PRESET, theme: 'nova', baseColor: 'olive', font: 'inter', fontHeading: 'lora', radius: 'large', accent: 'blue', chartColor: 'rose', menuAccent: 'bold' };
    look.load(encodePreset(golden));
    expect(look.preset()).toEqual(golden);
    look.load('ivp1_!!');
    expect(look.preset()).toEqual(DOCS_PRESET);
    look.load(encodePreset({ ...golden, baseColor: 'slate' }));
    expect(look.preset()).toEqual(DOCS_PRESET);
    look.load(null);
    expect(look.preset()).toEqual(DOCS_PRESET);
  });

  it('picking a look sets all its fields; switching style keeps your colors', () => {
    const { look } = create();
    expect(look.preset()).toEqual(THEMES.slate);
    expect(look.themeName()).toBe('slate');
    look.pickTheme('clay');
    expect(look.preset()).toEqual(THEMES.clay);
    expect(look.themeName()).toBe('clay');
    look.set({ theme: 'nova' });
    expect(look.preset()).toMatchObject({ theme: 'nova', baseColor: 'taupe', accent: 'rose' });
    expect(look.themeName()).toBe('nova');
  });

  it('the start share code is the CLI code for the slate theme', () => {
    const { look } = create();
    expect(look.code()).toBe(encodePreset(THEMES.slate));
  });

  it('dials reach the preview only where the style takes them', () => {
    const { look, stage } = create();
    look.pickTheme('slate');
    // Slate starts at default density: no --spacing.
    expect(stage.style.getPropertyValue('--spacing')).toBe('');
    look.set({ density: 'compact', rim: 'strong', blur: 'high' });
    TestBed.tick();
    expect(stage.style.getPropertyValue('--spacing')).toBe('0.2rem');
    expect(stage.style.getPropertyValue('--iv-rim')).toBe('2.2');
    expect(stage.style.getPropertyValue('--iv-blur')).toBe('');
    expect(look.takes('rim')).toBe(true);
    expect(look.takes('blur')).toBe(false);
    expect(look.takes('panels')).toBe(false);
    look.set({ density: 'default' });
    TestBed.tick();
    expect(stage.style.getPropertyValue('--spacing')).toBe('');
  });

  it('contrast high remixes muted text; motion off stops motion in the preview only', () => {
    const { look, stage } = create();
    look.set({ contrast: 'high', motion: 'off' });
    TestBed.tick();
    expect(stage.style.getPropertyValue('--muted-foreground')).toMatch(/^color-mix\(in oklab, /);
    expect(document.getElementById('docs-motion-off')?.textContent).toContain('.docs-preview');
    expect(look.css()).toContain('animation-duration: 0s !important');
    look.set({ motion: 'calm' });
    TestBed.tick();
    expect(document.getElementById('docs-motion-off')).toBeNull();
  });

  it('an old code with a legacy style still loads', () => {
    const { look } = create();
    look.load(encodePreset({ ...FILL_PRESET, theme: 'maia' }));
    expect(look.preset().theme).toBe('maia');
  });

  it('code and css follow the preset', () => {
    const { look } = create();
    expect(look.code()).toBe(encodePreset(DOCS_PRESET));
    look.set({ baseColor: 'olive', radius: 'large', font: 'inter', density: 'compact' });
    expect(look.css()).toContain('  --spacing: 0.2rem;');
    expect(look.css()).toContain(`:root {\n  --background: ${olive.light['--background']};`);
    expect(look.css()).toContain('  --radius: 0.875rem;');
    expect(look.css()).toContain(`.dark {\n  --background: ${olive.dark['--background']};`);
    expect(look.css()).toContain("@theme {\n  --font-sans: 'Inter Variable', sans-serif;\n}");
  });

  it('switching to mono picks its font and keeps the radius; leaving it drops that font', () => {
    const { look, stage } = create();
    look.set({ radius: 'large' });
    look.set({ theme: 'mono' });
    TestBed.tick();
    expect(look.preset()).toMatchObject({ theme: 'mono', font: 'geist-mono', radius: 'large' });
    expect(stage.style.getPropertyValue('--radius')).toBe('0.875rem');
    expect(stage.style.getPropertyValue('--font-sans')).toContain("'Geist Mono Variable'");
    look.set({ theme: 'nova' });
    expect(look.preset().font).toBe(DEFAULT_PRESET.font);
    look.set({ theme: 'mono' });
    look.set({ font: 'inter' });
    look.set({ theme: 'nova' });
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
