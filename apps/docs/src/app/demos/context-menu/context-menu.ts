import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_CONTEXT_MENU_IMPORTS } from '@inlaylab/ivorie/context-menu';

@Component({
  selector: 'demo-context-menu',
  imports: [IV_CONTEXT_MENU_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-context-menu>
      <div ivContextMenuTrigger class="flex h-36 w-72 items-center justify-center rounded-xl border border-dashed text-sm">
        Right-click here
      </div>
      <iv-dropdown-menu-content class="w-52">
        <iv-dropdown-menu-item>Back<iv-dropdown-menu-shortcut>⌘[</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
        <iv-dropdown-menu-item [disabled]="true">Forward<iv-dropdown-menu-shortcut>⌘]</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
        <iv-dropdown-menu-item>Reload<iv-dropdown-menu-shortcut>⌘R</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-checkbox-item [checked]="true">Show bookmarks</iv-dropdown-menu-checkbox-item>
        <iv-dropdown-menu-separator />
        <iv-dropdown-menu-item variant="destructive">Delete</iv-dropdown-menu-item>
      </iv-dropdown-menu-content>
    </iv-context-menu>
  `,
})
export default class ContextMenuDemo {}
