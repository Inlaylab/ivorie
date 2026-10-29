import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_AVATAR_IMPORTS } from '@ivorie/ui/avatar';

@Component({
  selector: 'demo-avatar-sizes',
  imports: [IV_AVATAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-4">
      <iv-avatar size="sm">
        <iv-avatar-image src="avatar.svg" alt="Small" />
        <iv-avatar-fallback>S</iv-avatar-fallback>
      </iv-avatar>
      <iv-avatar>
        <iv-avatar-image src="avatar.svg" alt="Default" />
        <iv-avatar-fallback>D</iv-avatar-fallback>
      </iv-avatar>
      <iv-avatar size="lg">
        <iv-avatar-image src="avatar.svg" alt="Large" />
        <iv-avatar-fallback>L</iv-avatar-fallback>
      </iv-avatar>
    </div>
  `,
})
export default class AvatarSizesDemo {}
