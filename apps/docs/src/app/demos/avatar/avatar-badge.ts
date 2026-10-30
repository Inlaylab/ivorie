import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_AVATAR_IMPORTS } from '@ivorie/ui/avatar';

@Component({
  selector: 'demo-avatar-badge',
  imports: [IV_AVATAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-avatar>
      <iv-avatar-image src="avatar.svg" alt="Ada Lovelace" />
      <iv-avatar-fallback>AL</iv-avatar-fallback>
      <iv-avatar-badge class="bg-primary ring-background" />
    </iv-avatar>
  `,
})
export default class AvatarBadgeDemo {}
