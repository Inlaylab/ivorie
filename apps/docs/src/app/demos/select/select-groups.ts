import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';

@Component({
  selector: 'demo-select-groups',
  imports: [IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-select [(value)]="city" placeholder="Pick a city">
      <iv-select-trigger class="w-56" aria-label="City" />
      <iv-select-content>
        <iv-select-group>
          <iv-select-label>North America</iv-select-label>
          <iv-select-item value="nyc">New York</iv-select-item>
          <iv-select-item value="la">Los Angeles</iv-select-item>
        </iv-select-group>
        <iv-select-separator />
        <iv-select-group>
          <iv-select-label>Europe</iv-select-label>
          <iv-select-item value="lon">London</iv-select-item>
          <iv-select-item value="par">Paris</iv-select-item>
        </iv-select-group>
      </iv-select-content>
    </iv-select>
  `,
})
export default class SelectGroupsDemo {
  protected readonly city = signal<string | null>(null);
}
