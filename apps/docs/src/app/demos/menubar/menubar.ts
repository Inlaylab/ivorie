import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_MENUBAR_IMPORTS } from '@inlaylab/ivorie/menubar';

@Component({
  selector: 'demo-menubar',
  imports: [IV_MENUBAR_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-menubar>
      <iv-menubar-menu>
        <button ivMenubarTrigger>File</button>
        <iv-dropdown-menu-content>
          <iv-dropdown-menu-item>New tab<iv-dropdown-menu-shortcut>⌘T</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
          <iv-dropdown-menu-item>New window<iv-dropdown-menu-shortcut>⌘N</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
          <iv-dropdown-menu-separator />
          <iv-dropdown-menu-item>Print…<iv-dropdown-menu-shortcut>⌘P</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
        </iv-dropdown-menu-content>
      </iv-menubar-menu>
      <iv-menubar-menu>
        <button ivMenubarTrigger>Edit</button>
        <iv-dropdown-menu-content>
          <iv-dropdown-menu-item>Undo<iv-dropdown-menu-shortcut>⌘Z</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
          <iv-dropdown-menu-item>Redo<iv-dropdown-menu-shortcut>⇧⌘Z</iv-dropdown-menu-shortcut></iv-dropdown-menu-item>
        </iv-dropdown-menu-content>
      </iv-menubar-menu>
      <iv-menubar-menu>
        <button ivMenubarTrigger>View</button>
        <iv-dropdown-menu-content>
          <iv-dropdown-menu-checkbox-item [checked]="true">Show sidebar</iv-dropdown-menu-checkbox-item>
          <iv-dropdown-menu-checkbox-item>Show status bar</iv-dropdown-menu-checkbox-item>
        </iv-dropdown-menu-content>
      </iv-menubar-menu>
    </iv-menubar>
  `,
})
export default class MenubarDemo {}
