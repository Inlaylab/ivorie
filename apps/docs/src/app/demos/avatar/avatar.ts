import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';

@Component({
  selector: 'demo-avatar',
  imports: [IV_AVATAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4">
      <iv-avatar>
        <iv-avatar-image src="avatar.svg" alt="Ada Lovelace" />
        <iv-avatar-fallback>AL</iv-avatar-fallback>
      </iv-avatar>
      <iv-avatar>
        <iv-avatar-fallback>GH</iv-avatar-fallback>
      </iv-avatar>
    </div>
  `,
})
export default class AvatarDemo {}
