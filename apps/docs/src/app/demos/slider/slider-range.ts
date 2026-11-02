import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvSlider } from '@inlaylab/ivorie/slider';

@Component({
  selector: 'demo-slider-range',
  imports: [IvSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full max-w-xs flex-col gap-3">
      <iv-slider aria-label="Price" [(value)]="price" [min]="0" [max]="1000" [step]="10" />
      <p class="text-muted-foreground text-sm">{{ price()?.[0] }} to {{ price()?.[1] }}</p>
    </div>
  `,
})
export default class SliderRangeDemo {
  protected readonly price = signal<number[] | null>([200, 800]);
}
