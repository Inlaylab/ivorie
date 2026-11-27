import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import ComponentsPage from './components';
import { PAGES } from '../../generated/pages';
import { GROUPS } from '../shell/site-nav';

const COMPONENT_SLUGS = new Set(PAGES.filter((p) => p.section === 'component').map((p) => p.slug));

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ComponentsPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('ComponentsPage', () => {
  it('shows one cell per component page, linking to it', async () => {
    const el = await render();
    const components = PAGES.filter((p) => p.section === 'component');
    const section = el.querySelector('[data-testid="components-section"]')!;
    const hrefs = [...section.querySelectorAll('li a')].map((a) => a.getAttribute('href'));
    expect([...hrefs].sort()).toEqual(components.map((p) => `/docs/${p.slug}`).sort());
    expect(el.textContent).toContain(components[0].description);
  });

  it('groups components by family, as the side nav does, with a count each', async () => {
    const el = await render();
    const families = GROUPS.filter((g) => g.pages.some((p) => COMPONENT_SLUGS.has(p.slug)));
    const groups = [...el.querySelectorAll('[data-testid="family"]')];
    expect(groups.map((g) => g.querySelector('h3')!.textContent!.trim())).toEqual(families.map((f) => f.label));
    groups.forEach((g, i) => {
      const n = families[i].pages.filter((p) => COMPONENT_SLUGS.has(p.slug)).length;
      expect(g.querySelectorAll('li a').length).toBe(n);
      expect(g.querySelector('[data-testid="family-count"]')!.textContent!.trim()).toBe(String(n));
    });
  });

  it('lays pages out in a hairline grid, not rounded cards', async () => {
    const el = await render();
    for (const ul of el.querySelectorAll('ul')) {
      expect(ul.className).toContain('gap-px');
      expect(ul.className).toContain('bg-(--docs-line)');
    }
    for (const a of el.querySelectorAll('li a')) expect(a.className).not.toMatch(/rounded/);
  });

  it('shows the chart example pages after the components, in their own section', async () => {
    const el = await render();
    const charts = PAGES.filter((p) => p.section === 'charts');
    const all = el.querySelector('[data-testid="components-section"]')!;
    const section = el.querySelector('[data-testid="charts-section"]')!;
    const hrefs = [...section.querySelectorAll('li a')].map((a) => a.getAttribute('href'));
    expect(charts.length).toBeGreaterThan(0);
    expect(hrefs).toEqual(charts.map((p) => `/docs/${p.slug}`));
    expect(all.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
