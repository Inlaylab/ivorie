import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import ComponentsPage from './components';
import { PAGES } from '../../generated/pages';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ComponentsPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('ComponentsPage', () => {
  it('shows one card per component page, linking to it', async () => {
    const el = await render();
    const components = PAGES.filter((p) => p.section === 'component');
    const section = el.querySelector('[data-testid="components-section"]')!;
    const hrefs = [...section.querySelectorAll('li a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(components.map((p) => `/docs/${p.slug}`));
    expect(el.textContent).toContain(components[0].description);
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
