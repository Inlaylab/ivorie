import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvChart, IvChartConfig } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart',
  imports: [IvChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<iv-chart [config]="config" class="w-full max-w-md" />`,
})
export default class ChartDemo {
  protected readonly config: IvChartConfig = {
    visits: { label: 'Visits', color: 'var(--chart-1)' },
  };
}
