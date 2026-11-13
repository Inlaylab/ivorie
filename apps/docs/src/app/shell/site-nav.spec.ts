import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { GROUPS, SiteNav } from './site-nav';
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

  it('puts every component in a named group', async () => {
    const more = GROUPS.find((g) => g.label === 'More');
    expect(more, more?.pages.map((p) => p.slug).join(', ')).toBeUndefined();
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

describe('SiteNav filter', () => {
  it('shows only matching pages, and a message when none match', async () => {
    const el = await render();
    const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    input.value = 'dialog';
    input.dispatchEvent(new Event('input'));
    await TestBed.inject(ApplicationRef).whenStable();
    const titles = [...el.querySelectorAll('li a')].map((a) => a.textContent!.trim());
    expect(titles).toEqual(['Alert Dialog', 'Dialog']);
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    await TestBed.inject(ApplicationRef).whenStable();
    expect(el.textContent).toContain('No page matches');
  });
});
