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

describe('RoadmapPage', () => {
  it('lists every item in order, shipped first, with exactly one up next', async () => {
    const el = await render();
    const items = [...el.querySelectorAll('ol > li')];
    expect(items.map((li) => li.querySelector('h2')?.textContent?.trim())).toEqual(ROADMAP.map((i) => i.title));
    const states = items.map((li) => li.getAttribute('data-state'));
    expect(states.filter((s) => s === 'next')).toHaveLength(1);
    // Nothing shipped after the next item.
    expect(states.lastIndexOf('shipped')).toBeLessThan(states.indexOf('next'));
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
