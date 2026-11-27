import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import NotFoundPage from './not-found';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(NotFoundPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('NotFoundPage', () => {
  it('says the page does not exist, draws a broken path, and links to Installation and Components', async () => {
    const el = await render();
    expect(el.querySelector('h1')!.textContent).toContain('This page does not exist');
    expect(el.querySelector('docs-line-lost svg[role="img"]')).not.toBeNull();
    const hrefs = [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/docs/installation', '/docs/components']);
  });

  it('has no axe violations', async () => {
    await expect(await render()).toHaveNoViolations();
  });
});
