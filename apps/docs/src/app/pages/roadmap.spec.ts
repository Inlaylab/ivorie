import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import RoadmapPage, { ROADMAP } from './roadmap';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(RoadmapPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

const titles = (el: Element, state: string) =>
  [...el.querySelectorAll(`[data-state="${state}"] h3`)].map((h) => h.textContent!.trim());

describe('RoadmapPage', () => {
  it('one timeline, newest on top: planned furthest first, then up next, then shipped newest first', async () => {
    const el = await render();
    expect(titles(el, 'next')).toEqual(ROADMAP.filter((i) => i.state === 'next').map((i) => i.title));
    expect(titles(el, 'planned')).toEqual(ROADMAP.filter((i) => i.state === 'planned').map((i) => i.title).reverse());
    const order = [...el.querySelectorAll('[data-state] h3')].map((h) => h.closest('[data-state]')!.getAttribute('data-state'));
    expect(order.indexOf('next')).toBeGreaterThan(order.lastIndexOf('planned'));
    expect(order.indexOf('shipped')).toBeGreaterThan(order.indexOf('next'));
    const shipped = ROADMAP.filter((i) => i.state === 'shipped');
    expect([...titles(el, 'shipped')].sort()).toEqual(shipped.map((i) => i.title).sort());
    // Newest version first; inside a version, the list order.
    expect(titles(el, 'shipped')[0]).toBe(shipped.find((i) => i.version === shipped.at(-1)!.version)!.title);
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
