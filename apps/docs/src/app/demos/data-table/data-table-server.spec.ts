import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import DataTableServerDemo from './data-table-server';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('DataTableServerDemo', () => {
  it('keeps the page count while the next page loads', async () => {
    const fixture = TestBed.createComponent(DataTableServerDemo);
    const el = fixture.nativeElement as HTMLElement;
    const page = () => el.querySelector('[data-slot="data-table-page"]')!.textContent!.trim();
    await wait(800);
    await fixture.whenStable();
    expect(page()).toBe('Page 1 of 20');
    el.querySelector<HTMLButtonElement>('button[aria-label="Go to next page"]')!.click();
    await wait(50);
    fixture.detectChanges();
    expect(page()).toBe('Page 2 of 20');
    expect(el.querySelector<HTMLButtonElement>('button[aria-label="Go to next page"]')!.disabled).toBe(false);
  });
});
