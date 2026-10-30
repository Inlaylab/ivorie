import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IV_BREADCRUMB_IMPORTS } from '@inlaylab/ivorie/breadcrumb';

@Component({
  selector: 'demo-breadcrumb-custom-separator',
  imports: [RouterLink, IV_BREADCRUMB_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav ivBreadcrumb>
      <ol ivBreadcrumbList>
        <li ivBreadcrumbItem><a ivBreadcrumbLink routerLink="/docs/breadcrumb">Home</a></li>
        <li ivBreadcrumbSeparator [showDefault]="false">/</li>
        <li ivBreadcrumbItem><a ivBreadcrumbLink routerLink="/docs/breadcrumb">Settings</a></li>
        <li ivBreadcrumbSeparator [showDefault]="false">/</li>
        <li ivBreadcrumbItem><span ivBreadcrumbPage>Profile</span></li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbCustomSeparatorDemo {}
