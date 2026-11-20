import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IvSparkline } from '@inlaylab/ivorie/sparkline';

@Component({
  selector: 'demo-sparkline',
  imports: [IvSparkline],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="w-full max-w-sm text-sm">
      <tbody>
        @for (r of rows; track r.name) {
          <tr class="border-b last:border-0">
            <td class="py-2 font-medium">{{ r.name }}</td>
            <td class="py-2"><svg ivSparkline [data]="r.trend" [type]="r.type" class="h-6 w-20"></svg></td>
            <td class="text-muted-foreground py-2 text-right tabular-nums">{{ r.value }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export default class SparklineDemo {
  protected readonly rows = [
    { name: 'Signups', value: '1,204', type: 'area' as const, trend: [12, 18, 15, 22, 28, 26, 34] },
    { name: 'Churn', value: '2.1%', type: 'line' as const, trend: [3.4, 3.1, 3.3, 2.8, 2.6, 2.4, 2.1] },
    { name: 'Deploys', value: '86', type: 'line' as const, trend: [9, 12, 8, 14, 11, 15, 17] },
  ];
}
