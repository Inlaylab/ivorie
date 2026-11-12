import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IvIdGenerator, cn } from '@inlaylab/ivorie/core';
import {
  IV_CHART,
  IvChartActive,
  IvChartConfig,
  IvChartContext,
  IvChartPayload,
  IvChartSize,
} from './types';
import { IvAreaChart, IvBarChart, IvLineChart } from './cartesian';
import { IvCartesianGrid, IvXAxis, IvYAxis } from './axis';
import { IvArea, IvLine } from './series';
import { IvBar } from './bar';
import { IvLabelList } from './label-list';
import { IvPieChart, IvPolarAngleAxis, IvPolarGrid, IvPolarRadiusAxis, IvRadarChart, IvRadialChart } from './polar';
import { IvPie } from './pie';
import { IvRadar } from './radar';
import { IvRadialBar } from './radial-bar';
import { IvChartLabel } from './chart-label';
import { IvChartRoot } from './interaction';
import { IvChartTooltip, IvChartTooltipContent, IvChartTooltipItem } from './tooltip';
import { IvChartLegend } from './legend';
import { IvActiveShape } from './active-shape';

const CHART_CLASSES = [
  'cn-chart relative flex aspect-video justify-center text-xs',
  '[&_.iv-chart-tick_text]:fill-muted-foreground',
  '[&_.iv-chart-grid_line]:stroke-border/50',
  '[&_.iv-chart-cursor-line]:stroke-border',
  '[&_.iv-chart-cursor-rect]:fill-muted',
  '[&_.iv-chart-polar-grid]:stroke-border',
  '[&_.iv-chart-reference-line]:stroke-border',
  '[&_.iv-chart-radial-background]:fill-muted',
  '[&_.iv-chart-dot]:stroke-transparent',
  '[&_.iv-chart-sector]:stroke-transparent',
  // The root keeps its keyboard focus ring; everything else draws no outline.
  '[&_svg:not(:focus-visible)]:outline-hidden [&_g]:outline-hidden [&_path]:outline-hidden',
].join(' ');

const THEMES = [
  ['light', ''],
  ['dark', '.dark'],
] as const;

/** Builds the scoped CSS that defines `--color-<key>` for theme series. */
function themeCss(id: string, config: IvChartConfig): string {
  const entries = Object.entries(config).filter(([, item]) => item.theme);
  if (!entries.length) return '';
  return THEMES.map(([theme, prefix]) => {
    const lines = entries.map(([key, item]) => `  --color-${key}: ${item.theme?.[theme]};`);
    return `${prefix} [data-chart=${id}] {\n${lines.join('\n')}\n}`.trim();
  }).join('\n');
}

@Component({
  selector: 'iv-chart',
  host: {
    'data-slot': 'chart',
    '[attr.data-chart]': 'id',
    '[style]': 'colorVars()',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: IV_CHART, useFactory: () => inject(IvChart).context }],
  template: `<ng-content />`,
})
export class IvChart {
  readonly config = input.required<IvChartConfig>();
  readonly initialDimension = input<IvChartSize>({ width: 320, height: 200 });
  readonly class = input('');

  protected readonly id = inject(IvIdGenerator).next('chart');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  private readonly measured = signal<IvChartSize | null>(null);
  private readonly size = computed(() => this.measured() ?? this.initialDimension());
  private styleEl: HTMLStyleElement | null = null;

  private readonly root = contentChild(IvChartRoot);
  private readonly tooltip = contentChild(IvChartTooltip);
  private readonly legend = contentChild(IvChartLegend);

  /**
   * The tooltip's `defaultIndex` until the pointer or the keyboard moves it. When the rows
   * shrink below the active one, it clears (a stale row never shows).
   */
  private readonly active = linkedSignal<
    { start: number | undefined; count: number },
    IvChartActive | null
  >({
    source: () => ({ start: this.tooltip()?.defaultIndex(), count: this.root()?.rowCount() ?? 0 }),
    computation: ({ start, count }, previous) => {
      if (!previous || previous.source.start !== start) {
        return start !== undefined && Number.isInteger(start) && start >= 0 ? { index: start } : null;
      }
      const active = previous.value;
      // Rows that only grew (or arrive late) keep the active row: the payload hides it until it exists.
      return active && (active.index < count || count >= previous.source.count) ? active : null;
    },
  });

  private readonly payload = computed<IvChartPayload[]>(() => {
    const active = this.active();
    const root = this.root();
    return active && root ? root.payload(active) : [];
  });

  private readonly reserve = computed(() => {
    const legend = this.legend();
    if (!legend) return { top: 0, bottom: 0 };
    const height = legend.height();
    return legend.verticalAlign() === 'top' ? { top: height, bottom: 0 } : { top: 0, bottom: height };
  });

  /** Shared with the chart parts through `IV_CHART`. */
  readonly context: IvChartContext = {
    id: this.id,
    config: this.config,
    size: this.size,
    active: this.active,
    payload: this.payload,
    source: this.root,
    reserve: this.reserve,
    cursor: computed(() => this.tooltip()?.cursor() ?? false),
    focused: signal(false),
  };

  protected readonly colorVars = computed(() => {
    const vars: Record<string, string> = {};
    for (const [key, item] of Object.entries(this.config())) {
      if (item.color) vars[`--color-${key}`] = item.color;
    }
    return vars;
  });

  protected readonly classes = computed(() => cn(CHART_CLASSES, this.class()));

  constructor() {
    // The <style> is made with Renderer2, so it is part of the server output.
    // Hydration does not adopt Renderer2 nodes: reuse the server's marked element
    // (and drop extras) instead of adding a second one. It goes last, so the
    // projected parts keep their place for hydration.
    effect(() => {
      const css = themeCss(this.id, this.config());
      const host = this.host.nativeElement;
      const found = Array.from(host.children).filter(
        (c): c is HTMLStyleElement => c.matches('style[data-chart-style]'),
      );
      let el = this.styleEl && found.includes(this.styleEl) ? this.styleEl : (found[0] ?? null);
      for (const extra of found) if (extra !== el) this.renderer.removeChild(host, extra);
      if (!css) {
        if (el) this.renderer.removeChild(host, el);
        this.styleEl = null;
        return;
      }
      if (!el) {
        el = this.renderer.createElement('style') as HTMLStyleElement;
        this.renderer.setAttribute(el, 'data-chart-style', '');
        this.renderer.appendChild(host, el);
      }
      this.styleEl = el;
      if (el.textContent !== css) el.textContent = css;
    });

    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view || typeof view.ResizeObserver === 'undefined') return;
      const observer = new view.ResizeObserver((entries) => {
        const rect = entries[entries.length - 1]?.contentRect;
        // A hidden tab or a closed sheet reports 0: keep the last good size.
        if (!rect || rect.width <= 0 || rect.height <= 0) return;
        this.measured.set({ width: rect.width, height: rect.height });
      });
      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

export const IV_CHART_IMPORTS = [
  IvChart,
  IvLineChart,
  IvAreaChart,
  IvBarChart,
  IvXAxis,
  IvYAxis,
  IvCartesianGrid,
  IvLine,
  IvArea,
  IvBar,
  IvLabelList,
  IvPieChart,
  IvRadarChart,
  IvRadialChart,
  IvPolarGrid,
  IvPolarAngleAxis,
  IvPolarRadiusAxis,
  IvPie,
  IvRadar,
  IvRadialBar,
  IvChartLabel,
  IvChartTooltip,
  IvChartTooltipContent,
  IvChartTooltipItem,
  IvChartLegend,
  IvActiveShape,
] as const;
