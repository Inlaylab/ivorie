import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-input-group-block',
  imports: [IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-input-group class="w-full max-w-sm">
      <input ivInputGroupInput #post (input)="length.set(post.value.length)" maxlength="140" placeholder="What is happening?" aria-label="Post" />
      <iv-input-group-addon align="block-end" class="border-t">
        <iv-input-group-text>{{ length() }}/140</iv-input-group-text>
        <iv-input-group-button variant="default" class="ml-auto">Post</iv-input-group-button>
      </iv-input-group-addon>
    </iv-input-group>
  `,
})
export default class InputGroupBlockDemo {
  protected readonly length = signal(0);
}
