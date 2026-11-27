import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
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
  it('the open page shows in ink with the accent dot, not a filled pill', async () => {
    @Component({ template: '' })
    class Blank {}
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'docs/:slug', component: Blank }])] });
    await TestBed.inject(Router).navigateByUrl('/docs/badge');
    const fixture = TestBed.createComponent(SiteNav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('a[aria-current="page"]')!;
    expect(active.getAttribute('href')).toBe('/docs/badge');
    expect(active.className).not.toMatch(/bg-foreground/);
    expect(active.querySelector('[data-testid="nav-mark"]')).not.toBeNull();
  });

  it('labels each group in small mono type', async () => {
    const el = await render();
    const labels = [...el.querySelectorAll('iv-sidebar-group-label')];
    expect(labels.length).toBeGreaterThan(0);
    for (const l of labels) expect(l.className).toMatch(/font-mono/);
  });
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

  it('groups guides under Get started and Guides', () => {
    const slugs = (label: string) => GROUPS.find((g) => g.label === label)?.pages.map((p) => p.slug) ?? [];
    expect(slugs('Get started')).toEqual(expect.arrayContaining(['installation', 'cli', 'components']));
    expect(slugs('Guides')).toEqual(expect.arrayContaining(['theming']));
    expect(slugs('Guides')).not.toContain('installation');
  });

  it('has the four new guides: Introduction first in Get started; Forms, Server rendering and Accessibility in Guides', () => {
    const slugs = (label: string) => GROUPS.find((g) => g.label === label)?.pages.map((p) => p.slug) ?? [];
    expect(slugs('Get started')[0]).toBe('introduction');
    expect(slugs('Guides')).toEqual(expect.arrayContaining(['forms', 'server-rendering', 'accessibility']));
  });

  it('keeps the old guide anchors, so links into them still land', async () => {
    const toc = async (slug: string) => (await PAGES.find((p) => p.slug === slug)!.load()).toc.map((t) => t.id);
    expect(await toc('installation')).toEqual(expect.arrayContaining(['requirements', 'quick-start-with-the-cli']));
    expect(await toc('theming')).toEqual(expect.arrayContaining(['share-codes', 'dark-mode']));
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

describe('SiteNav icons', () => {
  it('every guide link has an icon', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteNav);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    for (const p of PAGES.filter((p) => p.section === 'guide')) {
      expect(el.querySelector(`a[href="/docs/${p.slug}"] svg`), p.slug).not.toBeNull();
    }
  });
});
