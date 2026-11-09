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
  it('shows every item once: one up next, planned in order, shipped newest first', async () => {
    const el = await render();
    expect(titles(el, 'next')).toEqual(ROADMAP.filter((i) => i.state === 'next').map((i) => i.title));
    expect(titles(el, 'planned')).toEqual(ROADMAP.filter((i) => i.state === 'planned').map((i) => i.title));
    const shipped = ROADMAP.filter((i) => i.state === 'shipped');
    expect([...titles(el, 'shipped')].sort()).toEqual(shipped.map((i) => i.title).sort());
    expect(titles(el, 'shipped')[0]).toBe(shipped.at(-1)!.title);
  });

  it('counts each state', async () => {
    const el = await render();
    const shipped = ROADMAP.filter((i) => i.state === 'shipped').length;
    const planned = ROADMAP.filter((i) => i.state === 'planned').length;
    const pairs = [...el.querySelectorAll('[data-testid="counts"] > div')].map(
      (d) => `${d.querySelector('dd')!.textContent!.trim()} ${d.querySelector('dt')!.textContent!.trim()}`,
    );
    expect(pairs).toEqual([`${shipped} Shipped`, '1 Up next', `${planned} Planned`]);
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
