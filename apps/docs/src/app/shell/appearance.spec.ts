import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { APPEARANCE_KEY, Appearance } from './appearance';

function mockMatchMedia(dark: boolean) {
  const listeners: ((e: { matches: boolean }) => void)[] = [];
  const mq = {
    matches: dark,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(document.defaultView!, 'matchMedia', { configurable: true, value: () => mq });
  return (matches: boolean) => listeners.forEach((fn) => fn({ matches }));
}

function create() {
  const appearance = TestBed.inject(Appearance);
  TestBed.tick();
  return { appearance, doc: TestBed.inject(DOCUMENT) };
}

describe('Appearance', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    delete (document.defaultView as Partial<Window>).matchMedia;
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    document.body.className = '';
    document.head.querySelector('link#docs-style')?.remove();
  });

  it('defaults to system + maia with no storage', () => {
    mockMatchMedia(false);
    const { appearance } = create();
    expect(appearance.state()).toEqual({ mode: 'system', style: 'maia' });
  });

  it('falls back to defaults on corrupt JSON', () => {
    mockMatchMedia(false);
    localStorage.setItem(APPEARANCE_KEY, '{nope');
    const { appearance } = create();
    expect(appearance.state()).toEqual({ mode: 'system', style: 'maia' });
  });

  it('falls back to defaults when getItem throws', () => {
    mockMatchMedia(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { appearance } = create();
    expect(appearance.state()).toEqual({ mode: 'system', style: 'maia' });
  });

  it('setMode(dark) sets the class and keeps unknown keys in storage', () => {
    mockMatchMedia(false);
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ mode: 'light', style: 'maia', font: 'x' }));
    const { appearance, doc } = create();
    appearance.setMode('dark');
    TestBed.tick();
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    expect(doc.documentElement.style.colorScheme).toBe('dark');
    const saved = JSON.parse(localStorage.getItem(APPEARANCE_KEY)!);
    expect(saved).toEqual({ mode: 'dark', style: 'maia', font: 'x' });
  });

  it('system mode follows prefers-color-scheme and its changes', () => {
    const change = mockMatchMedia(true);
    const { appearance, doc } = create();
    expect(appearance.dark()).toBe(true);
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    change(false);
    TestBed.tick();
    expect(appearance.dark()).toBe(false);
    expect(doc.documentElement.classList.contains('dark')).toBe(false);
  });

  it('setStyle(maia) leaves one style class on body', () => {
    mockMatchMedia(false);
    const { appearance, doc } = create();
    doc.body.classList.add('style-old', 'keep');
    appearance.setStyle('maia');
    TestBed.tick();
    const styles = [...doc.body.classList].filter((c) => c.startsWith('style-'));
    expect(styles).toEqual(['style-maia']);
    expect(doc.body.classList.contains('keep')).toBe(true);
  });

  it('setStyle(nova) swaps the style class and saves it', () => {
    mockMatchMedia(false);
    const { appearance, doc } = create();
    appearance.setStyle('nova');
    TestBed.tick();
    expect([...doc.body.classList].filter((c) => c.startsWith('style-'))).toEqual(['style-nova']);
    expect(JSON.parse(localStorage.getItem(APPEARANCE_KEY)!).style).toBe('nova');
  });

  it('loads a non-default style sheet on demand and drops it for maia', () => {
    mockMatchMedia(false);
    const { appearance, doc } = create();
    const link = () => doc.head.querySelector<HTMLLinkElement>('link#docs-style');
    expect(link()).toBeNull();
    appearance.setStyle('rhea');
    TestBed.tick();
    expect(link()?.getAttribute('href')).toBe('style-rhea.css');
    appearance.setStyle('maia');
    TestBed.tick();
    expect(link()).toBeNull();
  });

  it('keeps a saved style that exists and drops one that does not', () => {
    mockMatchMedia(false);
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ mode: 'light', style: 'rhea' }));
    expect(create().appearance.state().style).toBe('rhea');
    TestBed.resetTestingModule();
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ mode: 'light', style: 'zzz' }));
    expect(create().appearance.state().style).toBe('maia');
  });
});
