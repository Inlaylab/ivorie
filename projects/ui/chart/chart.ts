import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Renderer2,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
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
  '[&_svg]:outline-hidden [&_g]:outline-hidden [&_path]:outline-hidden',
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
  private readonly active = signal<IvChartActive | null>(null);
  private readonly payload = signal<IvChartPayload[]>([]);
  private styleEl: HTMLStyleElement | null = null;

  /** Shared with the chart parts through `IV_CHART`. */
  readonly context: IvChartContext = {
    id: this.id,
    config: this.config,
    size: this.size,
    active: this.active,
    payload: this.payload,
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
    effect(() => {
      const css = themeCss(this.id, this.config());
      if (!css) {
        if (this.styleEl) {
          this.renderer.removeChild(this.host.nativeElement, this.styleEl);
          this.styleEl = null;
        }
        return;
      }
      if (!this.styleEl) {
        this.styleEl = this.renderer.createElement('style') as HTMLStyleElement;
        this.renderer.insertBefore(
          this.host.nativeElement,
          this.styleEl,
          this.host.nativeElement.firstChild,
        );
      }
      this.styleEl.textContent = css;
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

export const IV_CHART_IMPORTS = [IvChart] as const;
