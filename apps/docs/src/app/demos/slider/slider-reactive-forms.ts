import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IvSlider } from '@inlaylab/ivorie/slider';

@Component({
  selector: 'demo-slider-reactive-forms',
  imports: [IvSlider, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex w-full max-w-xs flex-col gap-3">
      <iv-slider aria-label="Opacity" [step]="0.1" [max]="1" [formControl]="opacity" />
      <p class="text-muted-foreground text-sm">Value: {{ opacity.value }}</p>
    </div>
  `,
})
export default class SliderReactiveFormsDemo {
  protected readonly opacity = new FormControl<number[] | null>([0.5]);
}
