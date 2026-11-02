import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSlider } from '@inlaylab/ivorie/slider';

@Component({
  selector: 'demo-slider-vertical',
  imports: [IvSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-48 gap-8">
      <iv-slider aria-label="Bass" orientation="vertical" [value]="[50]" />
      <iv-slider aria-label="Treble" orientation="vertical" [value]="[25, 75]" />
    </div>
  `,
})
export default class SliderVerticalDemo {}
