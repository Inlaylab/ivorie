import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import PlaygroundPage from './playground';
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
const commands = (el: HTMLElement) => [...rail(el).querySelectorAll('.font-mono .truncate')].map((s) => s.textContent!.trim());

describe('PlaygroundPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('style');
    document.documentElement.className = '';
    document.body.className = '';
    localStorage.clear();
  });

  it('shows 7 base colors as named radios', async () => {
    const { el } = await render();
    const colors = [...rail(el).querySelectorAll<HTMLInputElement>('input[name="rail-color"]')];
    expect(colors.map((c) => c.getAttribute('aria-label'))).toEqual(['Neutral', 'Stone', 'Zinc', 'Mauve', 'Olive', 'Mist', 'Taupe']);
    expect(colors[0].checked).toBe(true);
  });

  it('the default look gives the plain commands', async () => {
    const { el } = await render();
    expect(commands(el)).toEqual(['npx ivorie init', 'npx ivorie apply default']);
  });

  it('picking Olive puts its code in the commands and the URL', async () => {
    const { el, fixture, router } = await render();
    rail(el).querySelector<HTMLInputElement>('input[aria-label="Olive"]')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    const code = encodePreset({ style: 'maia', baseColor: 'olive', font: 'system', fontHeading: 'inherit', radius: 'default' });
    expect(commands(el)).toEqual([`npx ivorie init --preset ${code}`, `npx ivorie apply ${code}`]);
    expect(router.url).toBe(`/playground?preset=${code}`);
  });

  it('a preset in the URL is applied; a bad one gives the defaults', async () => {
    const code = encodePreset({ style: 'nova', baseColor: 'olive', font: 'inter', fontHeading: 'lora', radius: 'large' });
    const good = await render(`/playground?preset=${code}`);
    expect(rail(good.el).querySelector<HTMLInputElement>('input[aria-label="Olive"]')!.checked).toBe(true);
    TestBed.resetTestingModule();
    const bad = await render('/playground?preset=garbage');
    expect(commands(bad.el)[0]).toBe('npx ivorie init');
  });

  it('has no axe violations', async () => {
    const { el } = await render();
    await expect(el).toHaveNoViolations();
  });
});
