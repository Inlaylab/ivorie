import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';

@Component({
  selector: 'demo-native-select-small',
  imports: [IV_NATIVE_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-native-select size="sm">
      <select ivNativeSelect aria-label="Page size">
        <option ivNativeSelectOption value="10">10 rows</option>
        <option ivNativeSelectOption value="25">25 rows</option>
        <option ivNativeSelectOption value="50">50 rows</option>
      </select>
    </iv-native-select>
  `,
})
export default class NativeSelectSmallDemo {}
