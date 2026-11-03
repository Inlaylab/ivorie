import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IvButton } from '@inlaylab/ivorie/button';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_FIELD_IMPORTS } from '@inlaylab/ivorie/field';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { IV_NATIVE_SELECT_IMPORTS } from '@inlaylab/ivorie/native-select';
import { IV_RADIO_GROUP_IMPORTS } from '@inlaylab/ivorie/radio-group';
import { IvSlider } from '@inlaylab/ivorie/slider';
import { IvSwitch } from '@inlaylab/ivorie/switch';
import { IV_TABS_IMPORTS } from '@inlaylab/ivorie/tabs';

/** Playground scene: account settings in two tabs. Text fields, toggles and choices. */
@Component({
  selector: 'docs-scene-settings',
  imports: [
    IvButton,
    IV_CARD_IMPORTS,
    IV_FIELD_IMPORTS,
    IV_INPUT_IMPORTS,
    IV_NATIVE_SELECT_IMPORTS,
    IV_RADIO_GROUP_IMPORTS,
    IvSlider,
    IvSwitch,
    IV_TABS_IMPORTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mx-auto max-w-2xl">
      <h2 class="cn-font-heading text-2xl font-semibold tracking-tight">Settings</h2>
      <p class="text-muted-foreground mb-5 text-sm">Manage your profile and what we send you.</p>
      <iv-tabs defaultValue="profile">
        <iv-tabs-list>
          <iv-tabs-trigger value="profile">Profile</iv-tabs-trigger>
          <iv-tabs-trigger value="notifications">Notifications</iv-tabs-trigger>
        </iv-tabs-list>
        <iv-tabs-content value="profile">
          <iv-card>
            <iv-card-content>
              <iv-field-group>
                <div class="grid gap-4 sm:grid-cols-2">
                  <iv-field>
                    <label ivLabel for="st-name">Name</label>
                    <input ivInput id="st-name" value="Ada Lovelace" />
                  </iv-field>
                  <iv-field>
                    <label ivLabel for="st-email">Email</label>
                    <input ivInput id="st-email" type="email" value="ada@acme.dev" />
                  </iv-field>
                </div>
                <iv-field>
                  <label ivLabel for="st-lang">Language</label>
                  <iv-native-select>
                    <select ivNativeSelect id="st-lang">
                      <option ivNativeSelectOption value="en">English</option>
                      <option ivNativeSelectOption value="de">Deutsch</option>
                      <option ivNativeSelectOption value="fr">Français</option>
                    </select>
                  </iv-native-select>
                </iv-field>
                <iv-field>
                  <label ivLabel for="st-bio">Bio</label>
                  <textarea ivTextarea id="st-bio" rows="3">Wrote the first program. Likes engines.</textarea>
                  <iv-field-description>Shown on your public profile.</iv-field-description>
                </iv-field>
              </iv-field-group>
            </iv-card-content>
            <iv-card-footer class="justify-end gap-2">
              <button ivButton variant="ghost">Cancel</button>
              <button ivButton>Save changes</button>
            </iv-card-footer>
          </iv-card>
        </iv-tabs-content>
        <iv-tabs-content value="notifications">
          <iv-card>
            <iv-card-content class="flex flex-col gap-5">
              @for (n of notifications; track n.label) {
                <label class="flex items-center justify-between gap-4 text-sm">
                  <span class="flex flex-col gap-0.5">
                    {{ n.label }}
                    <span class="text-muted-foreground text-xs">{{ n.hint }}</span>
                  </span>
                  <iv-switch [checked]="n.on" />
                </label>
              }
              <div class="flex flex-col gap-2 border-t pt-5">
                <span class="text-sm font-medium" id="st-when">Email me</span>
                <iv-radio-group value="daily" aria-labelledby="st-when" class="flex flex-col gap-2">
                  @for (f of frequency; track f.value) {
                    <label class="flex items-center gap-2 text-sm"><iv-radio-group-item [value]="f.value" /> {{ f.label }}</label>
                  }
                </iv-radio-group>
              </div>
              <div class="flex flex-col gap-2 border-t pt-5">
                <span class="text-sm font-medium" id="st-quiet">Quiet hours start at {{ quiet() }}:00</span>
                <iv-slider aria-labelledby="st-quiet" [value]="[quiet()]" (valueChange)="quiet.set($event[0])" [min]="18" [max]="24" [step]="1" />
              </div>
            </iv-card-content>
          </iv-card>
        </iv-tabs-content>
      </iv-tabs>
    </div>
  `,
})
export class SceneSettings {
  protected readonly quiet = signal(22);
  protected readonly notifications = [
    { label: 'Mentions', hint: 'When someone tags you.', on: true },
    { label: 'Security alerts', hint: 'New sign-ins and password changes.', on: true },
    { label: 'Product news', hint: 'A few times a year.', on: false },
  ];
  protected readonly frequency = [
    { value: 'now', label: 'Right away' },
    { value: 'daily', label: 'Once a day' },
    { value: 'weekly', label: 'Once a week' },
  ];
}
