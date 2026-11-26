import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { COFFEE_URL } from './site-header';
import { SiteFooter } from './site-footer';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(SiteFooter);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('SiteFooter', () => {
  it('keeps the credits, the license and the site links', async () => {
    const el = await render();
    const text = el.textContent!.replace(/\s+/g, ' ');
    for (const s of ['Inlaylab', 'shadcn/ui', 'Radix UI', 'MIT license']) expect(text).toContain(s);
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    for (const h of ['/docs/components', '/blocks', '/changelog', 'https://github.com/Inlaylab/ivorie']) expect(hrefs).toContain(h);
  });

  it('groups links in four labelled columns', async () => {
    const el = await render();
    const nav = el.querySelector('nav[aria-label="Footer"]')!;
    const columns = [...nav.querySelectorAll(':scope > div')];
    expect(columns.map((c) => c.querySelector('h2')!.textContent!.trim())).toEqual(['Docs', 'Library', 'Project', 'Support']);
    const hrefs = columns.map((c) => [...c.querySelectorAll('ul a')].map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([
      ['/docs/installation', '/docs/cli'],
      ['/docs/components', '/blocks', '/playground'],
      ['/changelog', 'https://github.com/Inlaylab/ivorie'],
      [COFFEE_URL],
    ]);
    for (const a of nav.querySelectorAll('a[href^="https"]')) expect(a.getAttribute('rel')).toBe('noreferrer');
  });

  it('has no axe violations', async () => {
    await expect(await render()).toHaveNoViolations();
  });
});
