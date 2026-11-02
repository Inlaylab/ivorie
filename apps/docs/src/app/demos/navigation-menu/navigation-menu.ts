import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IV_NAVIGATION_MENU_IMPORTS, navigationMenuTriggerStyle } from '@inlaylab/ivorie/navigation-menu';

@Component({
  selector: 'demo-navigation-menu',
  imports: [IV_NAVIGATION_MENU_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-navigation-menu>
      <ul ivNavigationMenuList>
        <li ivNavigationMenuItem>
          <button ivNavigationMenuTrigger>Getting started</button>
          <iv-navigation-menu-content>
            <ul class="grid w-72 gap-1">
              @for (l of guides; track l.title) {
                <li>
                  <a ivNavigationMenuLink [href]="l.href" class="flex-col items-start gap-0.5">
                    <span class="font-medium">{{ l.title }}</span>
                    <span class="text-muted-foreground">{{ l.text }}</span>
                  </a>
                </li>
              }
            </ul>
          </iv-navigation-menu-content>
        </li>
        <li ivNavigationMenuItem>
          <button ivNavigationMenuTrigger>Components</button>
          <iv-navigation-menu-content>
            <ul class="grid w-96 grid-cols-2 gap-1">
              @for (c of components; track c) {
                <li><a ivNavigationMenuLink [href]="'docs/' + c">{{ c }}</a></li>
              }
            </ul>
          </iv-navigation-menu-content>
        </li>
        <li ivNavigationMenuItem>
          <a ivNavigationMenuLink href="docs/cli" [class]="triggerStyle">CLI</a>
        </li>
      </ul>
    </iv-navigation-menu>
  `,
})
export default class NavigationMenuDemo {
  protected readonly triggerStyle = navigationMenuTriggerStyle;
  protected readonly guides = [
    { title: 'Installation', text: 'Add Ivorie to an app.', href: 'docs/installation' },
    { title: 'Theming', text: 'Colors, radius and dark mode.', href: 'docs/theming' },
  ];
  protected readonly components = ['button', 'dialog', 'select', 'tabs'];
}
