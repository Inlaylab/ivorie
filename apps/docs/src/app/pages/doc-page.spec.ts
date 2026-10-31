import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import DocPageView from './doc-page';
import { loadDocPage } from './doc-page.resolver';
import { PAGES } from '../../generated/pages';

async function render(slug: string) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const data = await loadDocPage(PAGES.find((p) => p.slug === slug)!);
  const fixture = TestBed.createComponent(DocPageView);
  fixture.componentRef.setInput('page', data);
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, data };
}

describe('DocPage', () => {
  it('renders title, entry chip, demo frames and toc links', async () => {
    const { el, data } = await render('tabs');
    expect(el.querySelector('h1')?.textContent).toContain('Tabs');
    expect(el.querySelector('[data-entry]')?.textContent).toContain("from '@inlaylab/ivorie/tabs'");
    const demoSegments = data.page.segments.filter((s) => s.kind === 'demo').length;
    expect(el.querySelectorAll('docs-demo-frame').length).toBe(demoSegments);
    expect(el.querySelector('docs-install')?.textContent).toContain('npx ivorie add tabs');
    for (const item of data.page.toc) {
      expect(el.querySelector(`a[href$="#${item.id}"]`), item.id).not.toBeNull();
    }
  });

  it('shows preview and code together; long code starts collapsed and expands', async () => {
    const { el } = await render('dialog');
    const frame = el.querySelector('docs-demo-frame')!;
    expect(frame.querySelector('[role="tablist"]')).toBeNull();
    expect(frame.querySelector('.docs-preview')).not.toBeNull();
    expect(frame.querySelector('.docs-code .shiki')).not.toBeNull();
    const longFrame = [...el.querySelectorAll('docs-demo-frame')].find((f) => f.querySelector('[aria-controls]'))!;
    const button = longFrame.querySelector<HTMLButtonElement>('button[aria-controls]')!;
    expect(button.textContent).toContain('Expand');
    expect(longFrame.querySelector('[data-collapsed]')).not.toBeNull();
    button.click();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(longFrame.querySelector('[data-collapsed]')).toBeNull();
  });

  it('rebuilds demo frames when the page changes', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DocPageView);
    fixture.componentRef.setInput('page', await loadDocPage(PAGES.find((p) => p.slug === 'tabs')!));
    await fixture.whenStable();
    const before = fixture.nativeElement.querySelector('docs-demo-frame');
    const button = await loadDocPage(PAGES.find((p) => p.slug === 'button')!);
    fixture.componentRef.setInput('page', button);
    await fixture.whenStable();
    const frames = fixture.nativeElement.querySelectorAll('docs-demo-frame');
    expect(frames.length).toBe(button.page.segments.filter((s) => s.kind === 'demo').length);
    expect(frames[0]).not.toBe(before);
  });

  it('renders a guide without an entry chip', async () => {
    const { el } = await render('installation');
    expect(el.querySelector('h1')?.textContent).toContain('Installation');
    expect(el.querySelector('[data-entry]')).toBeNull();
  });

  it('renders the not-found view when the resolver finds no page (H9)', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(DocPageView);
    fixture.componentRef.setInput('page', null);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('docs-not-found')).not.toBeNull();
    expect(el.querySelector('h1')?.textContent).toContain('This page does not exist');
  });

  it('has no axe violations', async () => {
    const { el } = await render('tabs');
    await expect(el).toHaveNoViolations();
  }, 30_000); // axe over the whole page with tabs and code blocks.
});
