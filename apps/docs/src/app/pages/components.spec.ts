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
    const hrefs = [...el.querySelectorAll('li a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(components.map((p) => `/docs/${p.slug}`));
    expect(el.textContent).toContain(components[0].description);
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
