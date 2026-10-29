import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { SiteNav } from './site-nav';
import { PAGES } from '../../generated/pages';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(SiteNav);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('SiteNav', () => {
  it('links every page', async () => {
    const el = await render();
    for (const page of PAGES) {
      expect(el.querySelector(`a[href="/docs/${page.slug}"]`), page.slug).not.toBeNull();
    }
  });

  it('lists guides before components', async () => {
    const el = await render();
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs.indexOf('/docs/installation')).toBeLessThan(hrefs.indexOf('/docs/accordion'));
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
