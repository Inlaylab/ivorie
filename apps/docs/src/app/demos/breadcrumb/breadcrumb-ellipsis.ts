import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IV_BREADCRUMB_IMPORTS } from '@inlaylab/ivorie/breadcrumb';

@Component({
  selector: 'demo-breadcrumb-ellipsis',
  imports: [RouterLink, IV_BREADCRUMB_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav ivBreadcrumb>
      <ol ivBreadcrumbList>
        <li ivBreadcrumbItem><a ivBreadcrumbLink routerLink="/docs/breadcrumb">Home</a></li>
        <li ivBreadcrumbSeparator></li>
        <li ivBreadcrumbItem><span ivBreadcrumbEllipsis></span></li>
        <li ivBreadcrumbSeparator></li>
        <li ivBreadcrumbItem><span ivBreadcrumbPage>Current page</span></li>
      </ol>
    </nav>
  `,
})
export default class BreadcrumbEllipsisDemo {}
