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
  it('says coming soon and links to the roadmap', async () => {
    const el = await render();
    expect(el.querySelector('h1')?.textContent).toContain('Blocks');
    expect(el.textContent).toContain('Coming soon');
    expect(el.querySelector('a[href="/roadmap"]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const el = await render();
    await expect(el).toHaveNoViolations();
  });
});
