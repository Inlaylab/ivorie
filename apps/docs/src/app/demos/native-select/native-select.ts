import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';

@Component({
  selector: 'demo-native-select',
  imports: [IV_NATIVE_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-native-select>
      <select ivNativeSelect aria-label="Status">
        <option ivNativeSelectOption value="">Select status</option>
        <option ivNativeSelectOption value="todo">Todo</option>
        <option ivNativeSelectOption value="in-progress">In progress</option>
        <option ivNativeSelectOption value="done">Done</option>
      </select>
    </iv-native-select>
  `,
})
export default class NativeSelectDemo {}
