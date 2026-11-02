import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';

@Component({
  selector: 'demo-native-select-reactive-forms',
  imports: [IV_NATIVE_SELECT_IMPORTS, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center gap-3">
      <iv-native-select>
        <select ivNativeSelect aria-label="Plan" [formControl]="plan">
          <option ivNativeSelectOption value="free">Free</option>
          <option ivNativeSelectOption value="pro">Pro</option>
          <option ivNativeSelectOption value="team">Team</option>
        </select>
      </iv-native-select>
      <p class="text-muted-foreground text-sm">Value: {{ plan.value }}</p>
    </div>
  `,
})
export default class NativeSelectReactiveFormsDemo {
  protected readonly plan = new FormControl('pro');
}
