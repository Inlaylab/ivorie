import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Meta } from '@angular/platform-browser';
import type { LoadedDemo } from './all.resolver';

/** Hidden route: every demo on one server-rendered page, for the SSR smoke test. */
@Component({
  selector: 'docs-all',
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-4xl flex-col gap-12 p-8">
      <h1 class="text-2xl font-semibold">All components</h1>
      @for (d of demos(); track d.name) {
        <section [attr.data-demo]="d.name" class="flex flex-col gap-4">
          <h2 class="text-muted-foreground font-mono text-sm">{{ d.name }}</h2>
          <ng-container [ngComponentOutlet]="d.type" />
        </section>
      }
    </div>
  `,
})
export default class AllPage {
  readonly demos = input.required<LoadedDemo[]>();

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex' });
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => host.setAttribute('data-hydrated', 'true'));
  }
}
