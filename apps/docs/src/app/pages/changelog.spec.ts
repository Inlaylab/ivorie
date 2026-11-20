import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { CHANGELOG } from '../../generated/changelog';
import ChangelogPage from './changelog';
import { contentRoutes } from './content.routes';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(ChangelogPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('ChangelogPage', () => {
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
