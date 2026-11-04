import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { PreviewFrame, type PreviewWidth } from './preview-frame';

@Component({
  imports: [PreviewFrame],
  template: `<docs-preview-frame [path]="path()" [code]="code()" [width]="width()" label="Preview" />`,
})
class Host {
  readonly path = signal('preview/scene/team');
  readonly code = signal('ivp1_a');
  readonly width = signal<PreviewWidth>('desktop');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const iframe = (fixture.nativeElement as HTMLElement).querySelector('iframe')!;
  return { fixture, host: fixture.componentInstance, iframe };
}

describe('PreviewFrame', () => {
  it('src carries the path and the code; the title is the label', async () => {
    const { iframe } = await render();
    expect(iframe.getAttribute('src')).toBe('preview/scene/team?preset=ivp1_a');
    expect(iframe.title).toBe('Preview');
  });

  it('a code change posts a message and keeps src', async () => {
    const { fixture, host, iframe } = await render();
    const post = vi.spyOn(iframe.contentWindow!, 'postMessage');
    host.code.set('ivp1_x');
    await fixture.whenStable();
    expect(post).toHaveBeenCalledWith({ type: 'ivorie-look', preset: 'ivp1_x' }, location.origin);
    expect(iframe.getAttribute('src')).toBe('preview/scene/team?preset=ivp1_a');
  });

  it('a path change loads the new path with the current code', async () => {
    const { fixture, host, iframe } = await render();
    host.code.set('ivp1_x');
    host.path.set('preview/scene/checkout');
    await fixture.whenStable();
    expect(iframe.getAttribute('src')).toBe('preview/scene/checkout?preset=ivp1_x');
  });

  it('the load event sends the current look', async () => {
    const { iframe } = await render();
    const post = vi.spyOn(iframe.contentWindow!, 'postMessage');
    iframe.dispatchEvent(new Event('load'));
    expect(post).toHaveBeenCalledWith({ type: 'ivorie-look', preset: 'ivp1_a' }, location.origin);
  });

  it('a ready message from its own frame gets the current look', async () => {
    const { fixture, host, iframe } = await render();
    host.code.set('ivp1_x');
    await fixture.whenStable();
    const post = vi.spyOn(iframe.contentWindow!, 'postMessage');
    window.dispatchEvent(new MessageEvent('message', { origin: location.origin, source: iframe.contentWindow, data: { type: 'ivorie-preview-ready' } }));
    expect(post).toHaveBeenCalledWith({ type: 'ivorie-look', preset: 'ivp1_x' }, location.origin);
  });

  it('a ready message from another window or origin is ignored', async () => {
    const { iframe } = await render();
    const post = vi.spyOn(iframe.contentWindow!, 'postMessage');
    window.dispatchEvent(new MessageEvent('message', { origin: location.origin, source: window, data: { type: 'ivorie-preview-ready' } }));
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://evil.test', source: iframe.contentWindow, data: { type: 'ivorie-preview-ready' } }));
    expect(post).not.toHaveBeenCalled();
  });

  it('width sets the frame width', async () => {
    const { fixture, host, iframe } = await render();
    expect(iframe.style.width).toBe('100%');
    host.width.set('tablet');
    await fixture.whenStable();
    expect(iframe.style.width).toBe('768px');
  });
});
