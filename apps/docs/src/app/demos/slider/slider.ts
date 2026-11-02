import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSlider } from '@inlaylab/ivorie/slider';

@Component({
  selector: 'demo-slider',
  imports: [IvSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-slider aria-label="Volume" [value]="[75]" [max]="100" [step]="1" class="max-w-xs" />
  `,
})
export default class SliderDemo {}
