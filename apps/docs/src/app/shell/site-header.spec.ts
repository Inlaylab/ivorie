import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './site-header';

async function render(docs = false) {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(SiteHeader);
  fixture.componentRef.setInput('docs', docs);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('SiteHeader', () => {

  it('shows Changelog at every width', async () => {
    const { el } = await render();
    const changelog = el.querySelector('nav[aria-label="Main"] a[href="/changelog"]')!;
    expect(changelog.className).not.toMatch(/(^|\s)hidden(\s|$)/);
  });

  it('the menu is a native dialog: no overlay code in the first load', async () => {
    const { el } = await render();
    const dialog = el.querySelector('dialog#site-menu')!;
    expect(dialog).not.toBeNull();
    expect(el.querySelector('button[aria-label="Menu"]')!.getAttribute('aria-controls')).toBe('site-menu');
  });

  it('has one menu button on every page, and it says its state', async () => {
    const { el, fixture } = await render();
    const menu = el.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')!;
    expect(menu).not.toBeNull();
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    menu.click();
    await fixture.whenStable();
    expect(menu.getAttribute('aria-expanded')).toBe('true');
  });

  it('a menu link closes the menu, even to the page you are on (no navigation event)', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')!.click();
    await fixture.whenStable();
    const dialog = el.querySelector<HTMLDialogElement>('dialog#site-menu')!;
    expect(dialog.open).toBe(true);
    const github = dialog.querySelector<HTMLAnchorElement>('a[href^="https://github.com"]')!;
    github.addEventListener('click', (e) => e.preventDefault());
    github.click();
    await fixture.whenStable();
    expect(dialog.open).toBe(false);
  });

  it('the menu lists Docs, Components, Blocks, Playground, Changelog and GitHub', async () => {
    const { el, fixture } = await render();
    el.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')!.click();
    await fixture.whenStable();
    const overlay = el.querySelector('dialog#site-menu')!;
    const hrefs = [...overlay.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    for (const href of ['/docs/installation', '/docs/components', '/blocks', '/playground', '/changelog', 'https://github.com/Inlaylab/ivorie']) {
      expect(hrefs, href).toContain(href);
    }
  });

  it('on docs pages the menu also carries the docs nav', async () => {
    const { el, fixture } = await render(true);
    el.querySelector<HTMLButtonElement>('button[aria-label="Menu"]')!.click();
    await fixture.whenStable();
    const overlay = el.querySelector('dialog#site-menu')!;
    expect(overlay.querySelector('nav[aria-label="Docs"]')).not.toBeNull();
  });
});
