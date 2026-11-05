import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import BlocksPage from './blocks';

async function render() {
  TestBed.configureTestingModule({ providers: [provideRouter([])] });
  const fixture = TestBed.createComponent(BlocksPage);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('BlocksPage', () => {
  it('the index lists 19 blocks in 4 groups', async () => {
    const el = await render();
    expect(el.querySelector('h1')?.textContent).toContain('Blocks');
    expect([...el.querySelectorAll('h2')].map((h) => h.textContent!.trim())).toEqual(['Login', 'Sign up', 'Sidebar', 'Dashboard']);
    expect(el.querySelectorAll('a[href^="/blocks/"]').length).toBe(19);
    expect(el.querySelector('a[href="/blocks/login-01"]')!.textContent).toContain('Login 01');
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
