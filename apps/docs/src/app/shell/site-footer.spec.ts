import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  it('keeps the credits, the license and the site links', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const text = el.textContent!.replace(/\s+/g, ' ');
    for (const s of ['Inlaylab', 'shadcn/ui', 'Radix UI', 'MIT license']) expect(text).toContain(s);
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    for (const h of ['/docs/components', '/blocks', '/changelog', 'https://github.com/Inlaylab/ivorie']) expect(hrefs).toContain(h);
  });
});
