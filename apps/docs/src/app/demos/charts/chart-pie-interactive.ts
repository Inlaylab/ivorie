import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IV_CARD_IMPORTS } from '@inlaylab/ivorie/card';
import { IV_SELECT_IMPORTS } from '@inlaylab/ivorie/select';
import { IV_CHART_IMPORTS, IvChartConfig, IvSectorShape, ivArc } from '@inlaylab/ivorie/chart';

@Component({
  selector: 'demo-chart-pie-interactive',
  imports: [IV_CARD_IMPORTS, IV_CHART_IMPORTS, IV_SELECT_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <iv-card class="w-full max-w-md flex flex-col">
      <iv-card-header class="flex-row items-start space-y-0 pb-0">
        <div class="grid gap-1">
          <iv-card-title>Pie Chart - Interactive</iv-card-title>
          <iv-card-description>January - June 2024</iv-card-description>
        </div>
        <iv-select [(value)]="month">
          <iv-select-trigger
            class="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a value"
          />
          <iv-select-content class="rounded-xl">
            @for (key of months; track key) {
              <iv-select-item [value]="key" class="rounded-lg">
                <div class="flex items-center gap-2 text-xs">
                  <span
                    class="flex h-3 w-3 shrink-0 rounded-xs"
                    [style.background-color]="config[key].color"
                  ></span>
                  {{ config[key].label }}
                </div>
              </iv-select-item>
            }
          </iv-select-content>
        </iv-select>
      </iv-card-header>
      <iv-card-content class="flex flex-1 justify-center pb-0">
        <iv-chart [config]="config" class="mx-auto aspect-square w-full max-w-[300px]">
          <svg ivPieChart>
            <g
              ivPie
              [data]="data"
              dataKey="desktop"
              nameKey="month"
              [innerRadius]="60"
              [strokeWidth]="5"
              [activeIndex]="activeIndex()"
            >
              <ng-template ivActiveShape let-s>
                <svg:path [attr.d]="grow(s)" [attr.fill]="s.fill" />
                <svg:path [attr.d]="ring(s)" [attr.fill]="s.fill" />
              </ng-template>
              <ng-template ivChartLabel let-cx="cx" let-cy="cy">
                <svg:text
                  [attr.x]="cx"
                  [attr.y]="cy"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  <svg:tspan [attr.x]="cx" [attr.y]="cy" class="fill-foreground text-3xl font-bold">
                    {{ data[activeIndex()].desktop.toLocaleString() }}
                  </svg:tspan>
                  <svg:tspan [attr.x]="cx" [attr.y]="cy + 24" class="fill-muted-foreground">
                    Visitors
                  </svg:tspan>
                </svg:text>
              </ng-template>
            </g>
          </svg>
          <iv-chart-tooltip [cursor]="false" hideLabel />
        </iv-chart>
      </iv-card-content>
    </iv-card>
  `,
})
export default class ChartPieInteractive {
  protected readonly data = [
    { month: 'january', desktop: 186, fill: 'var(--color-january)' },
    { month: 'february', desktop: 305, fill: 'var(--color-february)' },
    { month: 'march', desktop: 237, fill: 'var(--color-march)' },
    { month: 'april', desktop: 173, fill: 'var(--color-april)' },
    { month: 'may', desktop: 209, fill: 'var(--color-may)' },
  ];

  protected readonly config: IvChartConfig = {
    visitors: { label: 'Visitors' },
    desktop: { label: 'Desktop' },
    mobile: { label: 'Mobile' },
    january: { label: 'January', color: 'var(--chart-1)' },
    february: { label: 'February', color: 'var(--chart-2)' },
    march: { label: 'March', color: 'var(--chart-3)' },
    april: { label: 'April', color: 'var(--chart-4)' },
    may: { label: 'May', color: 'var(--chart-5)' },
  };

  protected readonly months = this.data.map((row) => row.month);
  protected readonly month = signal<string | null>(this.months[0]);
  protected readonly activeIndex = computed(() =>
    Math.max(
      0,
      this.data.findIndex((row) => row.month === this.month()),
    ),
  );

  /** The active sector, 10px larger, and a ring around it. */
  protected readonly grow = (s: IvSectorShape) => ivArc({ ...s, outerRadius: s.outerRadius + 10 });
  protected readonly ring = (s: IvSectorShape) =>
    ivArc({ ...s, innerRadius: s.outerRadius + 12, outerRadius: s.outerRadius + 25 });
}
