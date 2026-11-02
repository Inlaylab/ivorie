import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';

@Component({
  selector: 'demo-native-select-groups',
  imports: [IV_NATIVE_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-native-select>
      <select ivNativeSelect aria-label="Department">
        <optgroup ivNativeSelectOptGroup label="Engineering">
          <option ivNativeSelectOption value="frontend">Frontend</option>
          <option ivNativeSelectOption value="backend">Backend</option>
        </optgroup>
        <optgroup ivNativeSelectOptGroup label="Sales">
          <option ivNativeSelectOption value="enterprise">Enterprise</option>
          <option ivNativeSelectOption value="smb">Small business</option>
        </optgroup>
      </select>
    </iv-native-select>
  `,
})
export default class NativeSelectGroupsDemo {}
