import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_COMMAND_IMPORTS } from '@inlaylab/ivorie/command';

@Component({
  selector: 'demo-command',
  imports: [IV_COMMAND_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-command class="max-w-sm rounded-lg border shadow-md">
      <iv-command-input placeholder="Type a command or search..." />
      <iv-command-list>
        <iv-command-empty>No results found.</iv-command-empty>
        <iv-command-group heading="Suggestions">
          <iv-command-item>Calendar</iv-command-item>
          <iv-command-item>Search Emoji</iv-command-item>
          <iv-command-item [disabled]="true">Calculator</iv-command-item>
        </iv-command-group>
        <iv-command-separator />
        <iv-command-group heading="Settings">
          <iv-command-item>Profile<iv-command-shortcut>⌘P</iv-command-shortcut></iv-command-item>
          <iv-command-item>Billing<iv-command-shortcut>⌘B</iv-command-shortcut></iv-command-item>
          <iv-command-item>Settings<iv-command-shortcut>⌘S</iv-command-shortcut></iv-command-item>
        </iv-command-group>
      </iv-command-list>
    </iv-command>
  `,
})
export default class CommandDemo {}
