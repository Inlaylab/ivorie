import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Type,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DOCUMENT, NgComponentOutlet } from '@angular/common';
import { cn } from '@inlaylab/ivorie/core';
import { IV_CHART } from './types';
import { ivPayloadConfig } from './scales';

/** One row of 12px text (16px line) plus `pt-3`: the legend's height before it is measured. */
const LEGEND_HEIGHT = 28;

interface Item {
  label: string;
  icon: Type<unknown> | null;
  color: string;
}

/**
 * shadcn's `ChartLegendContent`: a swatch (or the config icon) and the config label per series,
 * or per sector on a pie. Put it inside `iv-chart`; the chart leaves room for it.
 */
@Component({
  selector: 'iv-chart-legend',
  host: { 'data-slot': 'chart-legend', '[class]': 'classes()' },
  imports: [NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (item of items(); track $index) {
      <div
        data-slot="chart-legend-item"
        class="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
      >
        @if (item.icon && !hideIcon()) {
          <ng-container *ngComponentOutlet="item.icon" />
        } @else {
          <div class="h-2 w-2 shrink-0 rounded-[2px]" [style.background-color]="item.color"></div>
        }
        {{ item.label }}
      </div>
    }
  `,
})
export class IvChartLegend {
  readonly verticalAlign = input<'top' | 'bottom'>('bottom');
  readonly hideIcon = input(false, { transform: booleanAttribute });
  /** Row key whose string value names the config entry of each item (a pie's sector names). */
  readonly nameKey = input<string>();
  readonly class = input('');

  private readonly chart = inject(IV_CHART);
  private readonly measured = signal(LEGEND_HEIGHT);
  /** The space the legend takes from the chart, in px. */
  readonly height = this.measured.asReadonly();

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const view = doc.defaultView;
      if (!view || typeof view.ResizeObserver === 'undefined') return;
      const observer = new view.ResizeObserver(() => {
        const height = host.getBoundingClientRect().height;
        // Hidden (a closed tab): keep the last good height.
        if (height > 0) this.measured.set(height);
      });
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected readonly items = computed<Item[]>(() => {
    const config = this.chart.config();
    const nameKey = this.nameKey();
    return (this.chart.source()?.legend() ?? []).map((item) => {
      const entry = ivPayloadConfig(config, item, nameKey ?? item.key ?? 'value');
      return { label: entry?.label ?? '', icon: entry?.icon ?? null, color: item.color };
    });
  });

  protected readonly classes = computed(() =>
    cn(
      // Recharts' legend box: the chart width less its 5px margin, 5px from the edge.
      'absolute inset-x-[5px] flex items-center justify-center gap-4',
      this.verticalAlign() === 'top' ? 'top-[5px] pb-3' : 'bottom-[5px] pt-3',
      this.class(),
    ),
  );
}
