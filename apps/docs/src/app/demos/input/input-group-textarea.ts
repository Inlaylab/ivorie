import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@ivorie/ui/input';

@Component({
  selector: 'demo-input-group-textarea',
  imports: [IV_INPUT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-input-group class="w-full max-w-sm">
      <textarea ivInputGroupTextarea rows="3" placeholder="Write a comment" aria-label="Comment"></textarea>
      <iv-input-group-addon align="block-end" class="border-t">
        <iv-input-group-button variant="default" class="ml-auto">Send</iv-input-group-button>
      </iv-input-group-addon>
    </iv-input-group>
  `,
})
export default class InputGroupTextareaDemo {}
