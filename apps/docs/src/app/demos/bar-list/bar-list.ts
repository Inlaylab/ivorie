import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvBarList } from '@inlaylab/ivorie/bar-list';

@Component({
  selector: 'demo-bar-list',
  imports: [IvBarList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-bar-list [data]="pages" [format]="views" aria-label="Top pages" class="max-w-md" />
  `,
})
export default class BarListDemo {
  protected readonly pages = [
    { name: '/', value: 12840, href: '#' },
    { name: '/pricing', value: 4310, href: '#' },
    { name: '/docs/installation', value: 3920, href: '#' },
    { name: '/blog/zoneless', value: 1210, href: '#' },
    { name: '/changelog', value: 640, href: '#' },
  ];
  protected readonly views = (v: number) => v.toLocaleString('en-US');
}
