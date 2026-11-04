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
    expect(appearance.state()).toEqual({ mode: 'system' });
  });

  it('falls back to defaults on corrupt JSON', () => {
    mockMatchMedia(false);
    localStorage.setItem(APPEARANCE_KEY, '{nope');
    const { appearance } = create();
    expect(appearance.state()).toEqual({ mode: 'system' });
  });

  it('falls back to defaults when getItem throws', () => {
    mockMatchMedia(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { appearance } = create();
    expect(appearance.state()).toEqual({ mode: 'system' });
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

  it('toggle() flips what is showing and saves it', () => {
    mockMatchMedia(true);
    const { appearance, doc } = create();
    appearance.toggle();
    TestBed.tick();
    expect(appearance.state().mode).toBe('light');
    expect(doc.documentElement.classList.contains('dark')).toBe(false);
    appearance.toggle();
    expect(JSON.parse(localStorage.getItem(APPEARANCE_KEY)!).mode).toBe('dark');
  });

  it('does not touch the body style class', () => {
    mockMatchMedia(false);
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ mode: 'light', style: 'rhea' }));
    const { doc } = create();
    expect(doc.body.className).toBe('');
  });

  // The playground preview is an iframe on the same origin: the parent's toggle reaches it this way.
  it('follows a storage event from another page of the site', () => {
    mockMatchMedia(false);
    const { appearance, doc } = create();
    window.dispatchEvent(new StorageEvent('storage', { key: APPEARANCE_KEY, newValue: '{"mode":"dark"}' }));
    TestBed.tick();
    expect(appearance.dark()).toBe(true);
    expect(doc.documentElement.classList.contains('dark')).toBe(true);
    window.dispatchEvent(new StorageEvent('storage', { key: 'other-key', newValue: '{"mode":"light"}' }));
    TestBed.tick();
    expect(appearance.dark()).toBe(true);
  });
});
