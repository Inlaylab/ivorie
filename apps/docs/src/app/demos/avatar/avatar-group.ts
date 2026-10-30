import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_AVATAR_IMPORTS } from '@inlaylab/ivorie/avatar';

@Component({
  selector: 'demo-avatar-group',
  imports: [IV_AVATAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-avatar-group>
      <iv-avatar>
        <iv-avatar-image src="avatar.svg" alt="Ada" />
        <iv-avatar-fallback>A</iv-avatar-fallback>
      </iv-avatar>
      <iv-avatar>
        <iv-avatar-image src="avatar.svg" alt="Grace" />
        <iv-avatar-fallback>G</iv-avatar-fallback>
      </iv-avatar>
      <iv-avatar>
        <iv-avatar-image src="avatar.svg" alt="Linus" />
        <iv-avatar-fallback>L</iv-avatar-fallback>
      </iv-avatar>
      <iv-avatar-group-count>+3</iv-avatar-group-count>
    </iv-avatar-group>
  `,
})
export default class AvatarGroupDemo {}
