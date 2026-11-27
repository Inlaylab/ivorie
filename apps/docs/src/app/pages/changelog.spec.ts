import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { CHANGELOG } from '../../generated/changelog';
import { PAGES } from '../../generated/pages';
import ChangelogPage from './changelog';
import { contentRoutes } from './content.routes';

async function renderFixture() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ChangelogPage);
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, fixture };
}
const render = async () => (await renderFixture()).el;

describe('ChangelogPage', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('lists every release from CHANGELOG.md, newest first, with its date and title', async () => {
    const el = await render();
    const entries = [...el.querySelectorAll('article[data-version]')];
    expect(entries.map((e) => e.getAttribute('data-version'))).toEqual(CHANGELOG.map((c) => c.version));
    const first = entries[0];
    expect(first.querySelector('time')!.getAttribute('datetime')).toBe(CHANGELOG[0].date);
    expect(first.querySelector('h2')!.textContent).toContain(CHANGELOG[0].title);
    // The day shown is the day in CHANGELOG.md, in any timezone.
    expect(first.querySelector('time')!.textContent).toContain(String(Number(CHANGELOG[0].date.slice(8))));
    expect(first.querySelector('.docs-prose li')).not.toBeNull();
  });

  it('each release shows Changed first, as "Before you upgrade", then New, Improvements and Fixes', async () => {
    const el = await render();
    const order = ['changed', 'new', 'improvements', 'fixes'];
    for (const release of CHANGELOG) {
      const sections = [...el.querySelectorAll(`article[data-version="${release.version}"] [data-kind]`)];
      const want = [...release.sections].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
      expect(sections.map((s) => s.getAttribute('data-kind'))).toEqual(want.map((s) => s.kind));
      expect(sections.map((s) => s.querySelectorAll('li').length)).toEqual(want.map((s) => s.items.length));
      const changed = sections.find((s) => s.getAttribute('data-kind') === 'changed');
      if (changed) expect(changed.querySelector('h3')!.textContent!.trim()).toBe('Before you upgrade');
    }
    expect(CHANGELOG[0].sections.map((s) => s.label)).toEqual(['New', 'Changed', 'Improvements', 'Fixes']);
  });

  it('search keeps only the notes that match, marks the match, and says when nothing does', async () => {
    const { el, fixture } = await renderFixture();
    const q = el.querySelector<HTMLInputElement>('input[type="search"]')!;
    q.value = 'sidebar';
    q.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const items = [...el.querySelectorAll('article li')];
    expect(items.length).toBeGreaterThan(0);
    for (const li of items) expect(li.textContent!.toLowerCase()).toContain('sidebar');
    expect(el.querySelector('article li mark')!.textContent!.toLowerCase()).toBe('sidebar');
    q.value = 'zzzz-nothing';
    q.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(el.querySelectorAll('article').length).toBe(0);
    expect(el.querySelector('[data-testid="no-match"]')!.textContent).toContain('zzzz-nothing');
    el.querySelector<HTMLButtonElement>('[data-testid="no-match"] button')!.click();
    await fixture.whenStable();
    expect(el.querySelectorAll('article').length).toBe(CHANGELOG.length);
  });

  it('opens with a two-tone title and three numbers: releases, components, latest version', async () => {
    const el = await render();
    expect(el.querySelector('.docs-rail')).not.toBeNull();
    const h1 = el.querySelector('h1')!;
    expect(h1.textContent!.replace(/\s+/g, ' ').trim()).toBe("Product updates. What's new in Ivorie.");
    expect(h1.querySelector('span.text-foreground')!.textContent!.trim()).toBe('Ivorie.');
    const stats = [...el.querySelectorAll('[data-testid="overview-stat"]')].map((s) => s.querySelector('dd')!.textContent!.trim());
    expect(stats).toEqual([String(CHANGELOG.length), String(PAGES.filter((p) => p.section === 'component').length), `v${CHANGELOG[0].version}`]);
  });

  it('releases sit on a timeline: a hairline down the left, one node each, the latest in the accent', async () => {
    const el = await render();
    const line = el.querySelector('[data-testid="timeline"]')!;
    expect(line.className).toContain('before:w-px');
    const nodes = [...line.querySelectorAll('article [data-testid="node"]')];
    expect(nodes.length).toBe(CHANGELOG.length);
    expect(nodes[0].className).toContain('bg-(--brand)');
    expect(nodes[1].className).not.toContain('bg-(--brand)');
  });

  it('lays out each release in two columns; Before you upgrade spans both', async () => {
    const el = await render();
    for (const c of CHANGELOG) {
      const groups = el.querySelector(`article[data-version="${c.version}"] [data-testid="groups"]`)!;
      expect(groups.className).toContain('sm:grid-cols-2');
      const changed = groups.querySelector('[data-kind="changed"]');
      if (changed) expect(changed.className).toContain('sm:col-span-2');
    }
  });

  it('closes with what is next, as a hairline grid of cards', async () => {
    const el = await render();
    const next = el.querySelector('[data-testid="next"]')!;
    expect(next.className).toContain('gap-px');
    expect(next.className).toContain('bg-(--docs-line)');
    const articles = el.querySelectorAll('article[data-version]');
    expect(articles[articles.length - 1].compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('the upgrade digest and its commands are square hairline panes', async () => {
    const { el, fixture } = await renderFixture();
    el.querySelector<HTMLElement>('[data-testid="since"] [data-slot="select-trigger"]')!.click();
    await new Promise((r) => setTimeout(r));
    [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === '1.4.0')!.click();
    await fixture.whenStable();
    const digest = el.querySelector('[data-testid="digest"]')!;
    expect(digest.className).not.toMatch(/rounded/);
    const commands = [...digest.querySelectorAll('[data-testid="digest-command"]')];
    expect(commands.length).toBe(2);
    for (const c of commands) {
      expect(c.classList).toContain('docs-pane');
      expect(c.className).not.toMatch(/rounded|bg-muted/);
    }
  });

  it('"I\'m on" a version: a digest of every note since, Changed first, each tagged with its release', async () => {
    const { el, fixture } = await renderFixture();
    el.querySelector<HTMLElement>('[data-testid="since"] [data-slot="select-trigger"]')!.click();
    await new Promise((r) => setTimeout(r));
    [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((o) => o.textContent!.trim() === '1.4.0')!.click();
    await fixture.whenStable();
    const digest = el.querySelector('[data-testid="digest"]')!;
    const newer = CHANGELOG.slice(0, CHANGELOG.findIndex((c) => c.version === '1.4.0')).map((c) => c.version);
    const tags = [...digest.querySelectorAll('[data-testid="digest-version"]')].map((t) => t.textContent!.trim());
    expect(new Set(tags)).toEqual(new Set(newer));
    expect(digest.querySelector('[data-kind]')!.getAttribute('data-kind')).toBe('changed');
    const count = CHANGELOG.filter((c) => newer.includes(c.version)).reduce((n, c) => n + c.sections.reduce((m, s) => m + s.items.length, 0), 0);
    expect(digest.querySelectorAll('li').length).toBe(count);
    expect(digest.textContent).toContain('npm i @inlaylab/ivorie@latest');
  });

  it('the release rail marks the release in view and the latest one', async () => {
    let fire: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};
    const real = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb: (e: Partial<IntersectionObserverEntry>[]) => void) {
        fire = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    try {
      const { el, fixture } = await renderFixture();
      const target = el.querySelector('article[data-version="1.5.0"]')!;
      fire([{ isIntersecting: true, target }]);
      await fixture.whenStable();
      const nav = el.querySelector('nav[aria-label="Releases"]')!;
      expect(nav.querySelector('[aria-current="true"]')!.textContent).toContain('1.5.0');
      expect(nav.querySelector('a')!.textContent).toContain('Latest');
    } finally {
      globalThis.IntersectionObserver = real;
    }
  });

  it('1.6.0 shows its parts live: a button in four themes, a meter and a sparkline', async () => {
    const el = await render();
    const card = el.querySelector('article[data-version="1.6.0"] [data-testid="release-visual"]')!;
    expect(card).not.toBeNull();
    expect(card.querySelectorAll('[data-theme]').length).toBe(4);
    expect(card.querySelector('[role="meter"]')).not.toBeNull();
    expect(card.querySelector('svg[ivSparkline], svg[ivsparkline]')).not.toBeNull();
  });

  it('1.5.0 shows a live bar chart; 1.4.0 a table of its first blocks', async () => {
    const el = await render();
    const charts = el.querySelector('article[data-version="1.5.0"] [data-testid="release-visual"]')!;
    expect(charts.querySelector('svg[ivBarChart], svg[ivbarchart]')).not.toBeNull();
    const blocks = el.querySelector('article[data-version="1.4.0"] [data-testid="release-visual"]')!;
    expect([...blocks.querySelectorAll('td')].map((td) => td.textContent!.trim())).toEqual(expect.arrayContaining(['login-01', 'signup-01', 'sidebar-01', 'dashboard-01']));
  });

  it('a release list links every version to its anchor; each release links to itself', async () => {
    const el = await render();
    const nav = el.querySelector('nav[aria-label="Releases"]')!;
    const links = [...nav.querySelectorAll('a')];
    expect(links.map((a) => a.textContent!.trim().split(/\s+/)[0])).toEqual(CHANGELOG.map((c) => c.version));
    expect(links[0].getAttribute('href')).toMatch(/#v1-6-0$/);
    for (const c of CHANGELOG) {
      const id = 'v' + c.version.replaceAll('.', '-');
      const self = el.querySelector(`article[data-version="${c.version}"] a[data-testid="permalink"]`)!;
      expect(self.getAttribute('href')).toMatch(new RegExp(`#${id}$`));
      expect(self.getAttribute('aria-label')).toBe(`Link to ${c.version}`);
    }
  });

  it('a kind filter: Fixes keeps only releases with fixes, and only their fixes', async () => {
    const el = await render();
    const kinds = [...el.querySelectorAll<HTMLInputElement>('[role="radiogroup"][aria-label="Show"] input')];
    expect(kinds.map((k) => k.value)).toEqual(['all', 'new', 'changed', 'improvements', 'fixes']);
    expect(kinds[0].checked).toBe(true);
    kinds[4].click();
    await TestBed.inject(ApplicationRef).whenStable();
    const shown = [...el.querySelectorAll('article[data-version]')].map((a) => a.getAttribute('data-version'));
    expect(shown).toEqual(CHANGELOG.filter((c) => c.sections.some((s) => s.kind === 'fixes')).map((c) => c.version));
    expect([...el.querySelectorAll('article [data-kind]')].every((s) => s.getAttribute('data-kind') === 'fixes')).toBe(true);
  });

  it('links the RSS feed', async () => {
    const el = await render();
    expect(el.querySelector('a[href="changelog.xml"]')!.textContent).toContain('RSS');
  });

  it('shows what is next: 1.7.0 and 2.0.0', async () => {
    const el = await render();
    const next = [...el.querySelectorAll('[data-testid="next"] [data-version]')].map((n) => n.getAttribute('data-version'));
    expect(next).toEqual(['1.7.0', '2.0.0']);
  });

  it('/roadmap still works: it redirects to /changelog', () => {
    const children = contentRoutes[0].children!;
    expect(children.find((r) => r.path === 'roadmap')?.redirectTo).toBe('changelog');
    expect(children.find((r) => r.path === 'changelog')).toBeDefined();
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
