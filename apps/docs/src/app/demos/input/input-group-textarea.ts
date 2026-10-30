import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IV_INPUT_IMPORTS } from '@inlaylab/ivorie/input';
import { LucidePaperclip, LucideSmile } from '@lucide/angular';

@Component({
  selector: 'demo-input-group-textarea',
  imports: [IV_INPUT_IMPORTS, LucidePaperclip, LucideSmile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-input-group class="w-full max-w-sm">
      <textarea
        ivInputGroupTextarea
        rows="2"
        maxlength="280"
        placeholder="Message #general"
        aria-label="Message"
        [value]="message()"
        (input)="onInput($event)"
      ></textarea>
      <iv-input-group-addon align="block-end" class="border-t">
        <iv-input-group-button size="icon-xs" aria-label="Attach file">
          <svg lucidePaperclip></svg>
        </iv-input-group-button>
        <iv-input-group-button size="icon-xs" aria-label="Add emoji">
          <svg lucideSmile></svg>
        </iv-input-group-button>
        <iv-input-group-text class="ml-auto tabular-nums">{{ message().length }}/280</iv-input-group-text>
        <iv-input-group-button variant="default" [disabled]="!message().trim()">Send</iv-input-group-button>
      </iv-input-group-addon>
    </iv-input-group>
  `,
})
export default class InputGroupTextareaDemo {
  protected readonly message = signal('');

  protected onInput(event: Event) {
    this.message.set((event.target as HTMLTextAreaElement).value);
  }
}
