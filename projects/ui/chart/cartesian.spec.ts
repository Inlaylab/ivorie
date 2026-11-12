import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  IV_CARTESIAN, IV_CHART, IV_CHART_IMPORTS, IV_SERIES, IvChartConfig, IvChartDatum, IvDotProps,
} from '@inlaylab/ivorie/chart';

const SVG_NS = 'http://www.w3.org/2000/svg';

// shadcn chart-area-stacked.
const MONTHS: IvChartDatum[] = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const CONFIG: IvChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
};

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivAreaChart [data]="data()" [margin]="{ left: 12, right: 12 }" ariaLabel="Visitors by month">
        <g ivCartesianGrid [vertical]="vertical()" />
        <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="8" [tickFormatter]="formatter()" />
        @if (showMobile()) {
          <g ivArea dataKey="mobile" curve="natural" stackId="a" />
        }
        <g ivArea dataKey="desktop" curve="natural" stackId="a" />
      </svg>
    </iv-chart>
  `,
})
class AreaHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(MONTHS);
  vertical = signal(true);
  showMobile = signal(true);
  formatter = signal<((value: string) => string) | undefined>(undefined);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivLineChart [data]="data()" ariaLabel="Desktop visitors">
        <g ivCartesianGrid />
        <g ivXAxis dataKey="month" />
        <g ivYAxis />
        <g ivLine dataKey="desktop" [curve]="curve()" [dot]="custom() ? dotTpl : true" />
        <ng-template #dotTpl let-dot>
          <svg:circle data-slot="custom-dot" r="5" [attr.cx]="dot.cx" [attr.cy]="dot.cy" [attr.data-month]="dot.payload.month" />
        </ng-template>
      </svg>
    </iv-chart>
  `,
})
class LineHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(MONTHS);
  curve = signal<'linear' | 'step'>('linear');
  custom = signal(false);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivAreaChart [data]="data" stackOffset="expand">
        <g ivYAxis />
        <g ivArea dataKey="mobile" stackId="a" />
        <g ivArea dataKey="desktop" stackId="a" />
      </svg>
    </iv-chart>
  `,
})
class ExpandHost {
  config = CONFIG;
  data = MONTHS;
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivLineChart [data]="data">
        <g ivLine dataKey="desktop" [dot]="dot()" [activeDot]="activeDot()" [strokeWidth]="3" />
      </svg>
    </iv-chart>
  `,
})
class DotPropsHost {
  config = CONFIG;
  data = MONTHS;
  dot = signal<boolean | IvDotProps>({ fill: 'var(--color-desktop)' });
  activeDot = signal<boolean | IvDotProps>({ r: 6 });
}

async function render<T>(type: new () => T, patch?: (host: T) => void) {
  const fixture = TestBed.createComponent(type);
  patch?.(fixture.componentInstance);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, svg: el.querySelector('svg') as SVGSVGElement };
}

const areas = (el: Element) => Array.from(el.querySelectorAll('path[data-slot="chart-area"]'));
const line = (el: Element) => el.querySelector('path[data-slot="chart-line"]');
const tickLabels = (el: Element) =>
  Array.from(el.querySelectorAll('[data-slot="chart-x-axis"] .iv-chart-tick text')).map((t) => t.textContent?.trim());

describe('Cartesian charts', () => {
  it('renders projected parts as real SVG elements', async () => {
    const { el } = await render(AreaHost);
    const path = areas(el)[0];
    expect(path).toBeDefined();
    expect(path.namespaceURI).toBe(SVG_NS);
    expect(path.parentElement?.namespaceURI).toBe(SVG_NS);
  });

  it('draws lines in over a normalised path, motion-safe only', async () => {
    const { el } = await render(LineHost);
    const path = line(el)!;
    expect(path.getAttribute('pathLength')).toBe('1');
    expect(path.getAttribute('class')).toContain('motion-safe:animate-chart-draw');
    const area = await render(AreaHost);
    expect(area.el.querySelector('[data-slot="chart-area"]')!.getAttribute('class')).toContain('motion-safe:animate-chart-fade');
    expect(area.el.querySelector('[data-slot="chart-area-stroke"]')!.getAttribute('pathLength')).toBe('1');
  });

  it('draws two stacked areas', async () => {
    const { el, fixture } = await render(AreaHost);
    const paths = areas(el);
    expect(paths.length).toBe(2);
    for (const path of paths) {
      const d = path.getAttribute('d') ?? '';
      expect(d.startsWith('M')).toBe(true);
      expect(d).not.toContain('NaN');
    }
    expect(paths[0].getAttribute('fill')).toBe('var(--color-mobile)');
    expect(paths[0].getAttribute('fill-opacity')).toBe('0.6');
    // mobile is the base of the stack: desktop's top is higher (smaller y) on every row.
    const ctx = fixture.debugElement.query((d) => d.name === 'svg').injector.get(IV_CARTESIAN);
    const mobile = ctx.points('mobile')();
    const desktop = ctx.points('desktop')();
    expect(desktop[1]?.y0).toBeCloseTo(mobile[1]!.y1);
    expect(ctx.value().domain()).toEqual([0, 600]);
  });

  it('labels one tick per row', async () => {
    const { el } = await render(AreaHost);
    expect(tickLabels(el)).toEqual(['January', 'February', 'March', 'April', 'May', 'June']);
  });

  it('formats ticks with tickFormatter', async () => {
    const { el } = await render(AreaHost, (h) => h.formatter.set((v) => v.slice(0, 3)));
    expect(tickLabels(el)).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
  });

  it('hides vertical grid lines', async () => {
    const { el, fixture } = await render(AreaHost);
    const grid = () => el.querySelector('[data-slot="chart-grid"]') as Element;
    expect(grid().querySelectorAll('line[data-direction="vertical"]').length).toBe(6);
    fixture.componentInstance.vertical.set(false);
    await fixture.whenStable();
    expect(grid().querySelectorAll('line[data-direction="vertical"]').length).toBe(0);
    expect(grid().querySelectorAll('line[data-direction="horizontal"]').length).toBeGreaterThan(0);
  });

  it('unregisters a series on destroy', async () => {
    const { el, fixture } = await render(AreaHost);
    fixture.componentInstance.showMobile.set(false);
    await fixture.whenStable();
    expect(areas(el).length).toBe(1);
    const ctx = fixture.debugElement.query((d) => d.name === 'svg').injector.get(IV_CARTESIAN);
    expect(ctx.value().domain()).toEqual([0, 350]);
  });

  it('draws a step line with only M, H, V and L commands', async () => {
    const { el } = await render(LineHost, (h) => h.curve.set('step'));
    const d = line(el)?.getAttribute('d') ?? '';
    expect(d.startsWith('M')).toBe(true);
    expect(d.replace(/[\d.,\s-]/g, '')).toMatch(/^[MHVL]+$/);
  });

  it('draws a dot per row and gives IV_SERIES items', async () => {
    const { el, fixture } = await render(LineHost);
    expect(el.querySelectorAll('[data-slot="chart-dot"]').length).toBe(6);
    const series = fixture.debugElement.query((d) => d.attributes['ivLine'] !== undefined).injector.get(IV_SERIES);
    expect(series.key).toBe('desktop');
    expect(series.items().map((i) => i.value)).toEqual([186, 305, 237, 73, 209, 214]);
  });

  it('gives IV_SERIES items for an area, with the row', async () => {
    const { fixture } = await render(AreaHost);
    const series = fixture.debugElement
      .queryAll((d) => d.attributes['ivArea'] !== undefined)
      .map((d) => d.injector.get(IV_SERIES));
    expect(series.map((s) => s.key)).toEqual(['mobile', 'desktop']);
    const items = series[1].items();
    expect(items.map((i) => i.value)).toEqual([186, 305, 237, 73, 209, 214]);
    expect(items[0].payload).toBe(MONTHS[0]);
    expect(items[0].fill).toBe('var(--color-desktop)');
  });

  it('lists series in markup order with their color', async () => {
    const { fixture } = await render(AreaHost);
    const ctx = fixture.debugElement.query((d) => d.name === 'svg').injector.get(IV_CARTESIAN);
    expect(ctx.series().map((s) => [s.key, s.color()])).toEqual([
      ['mobile', 'var(--color-mobile)'],
      ['desktop', 'var(--color-desktop)'],
    ]);
  });

  it('draws a custom dot template with the row', async () => {
    const { el } = await render(LineHost, (h) => h.custom.set(true));
    const dots = el.querySelectorAll('[data-slot="custom-dot"]');
    expect(dots.length).toBe(6);
    expect(dots[0].namespaceURI).toBe(SVG_NS);
    expect(dots[0].getAttribute('data-month')).toBe('January');
    expect(el.querySelectorAll('[data-slot="chart-dot"]').length).toBe(0);
  });

  it('labels the Y axis with value ticks', async () => {
    const { el } = await render(LineHost);
    const labels = Array.from(el.querySelectorAll('[data-slot="chart-y-axis"] .iv-chart-tick text'));
    expect(labels.map((t) => t.textContent?.trim())).toEqual(['0', '50', '100', '150', '200', '250', '300', '350']);
  });

  it('draws the active dot at the active index', async () => {
    const { el, fixture } = await render(LineHost);
    expect(el.querySelector('[data-slot="chart-active-dot"]')).toBeNull();
    fixture.debugElement.query((d) => d.name === 'iv-chart').injector.get(IV_CHART).active.set({ index: 1, x: 0, y: 0 });
    await fixture.whenStable();
    const dot = el.querySelector('[data-slot="chart-active-dot"]');
    expect(dot?.getAttribute('fill')).toBe('var(--color-desktop)');
    expect(dot?.getAttribute('stroke')).toBe('var(--background)');
  });

  it('merges dot and activeDot props over the defaults (Recharts objects)', async () => {
    const { el, fixture } = await render(DotPropsHost);
    const dots = el.querySelectorAll('[data-slot="chart-dot"]');
    expect(dots.length).toBe(6);
    // Recharts: r 3, the line's stroke and stroke width, then the given props.
    expect(dots[0].getAttribute('r')).toBe('3');
    expect(dots[0].getAttribute('fill')).toBe('var(--color-desktop)');
    expect(dots[0].getAttribute('stroke')).toBe('var(--color-desktop)');
    expect(dots[0].getAttribute('stroke-width')).toBe('3');
    fixture.debugElement.query((d) => d.name === 'iv-chart').injector.get(IV_CHART).active.set({ index: 1 });
    await fixture.whenStable();
    const active = el.querySelector('[data-slot="chart-active-dot"]')!;
    expect(active.getAttribute('r')).toBe('6');
    expect(active.getAttribute('fill')).toBe('var(--color-desktop)');
    expect(active.getAttribute('stroke')).toBe('var(--background)');
    expect(active.getAttribute('class')).toBe('iv-chart-dot');
    // A given stroke is kept: the container's transparent-stroke rule does not apply.
    fixture.componentInstance.activeDot.set({ stroke: 'red' });
    fixture.componentInstance.dot.set(false);
    await fixture.whenStable();
    expect(el.querySelectorAll('[data-slot="chart-dot"]').length).toBe(0);
    const red = el.querySelector('[data-slot="chart-active-dot"]')!;
    expect(red.getAttribute('stroke')).toBe('red');
    expect(red.getAttribute('r')).toBe('4');
    expect(red.getAttribute('class')).toBeNull();
    fixture.componentInstance.activeDot.set(false);
    await fixture.whenStable();
    expect(el.querySelector('[data-slot="chart-active-dot"]')).toBeNull();
  });

  it('expands stacks to 0..1', async () => {
    const { fixture } = await render(ExpandHost);
    const ctx = fixture.debugElement.query((d) => d.name === 'svg').injector.get(IV_CARTESIAN);
    expect(ctx.value().domain()).toEqual([0, 1]);
    const plot = ctx.plot();
    const points = ctx.points('desktop')();
    expect(points.length).toBe(6);
    for (const p of points) expect(p?.y1).toBeCloseTo(plot.y);
  });

  it('breaks the line at a null value', async () => {
    const data = MONTHS.map((row, i) => (i === 2 ? { ...row, desktop: null } : row));
    const { el, fixture } = await render(LineHost, (h) => h.data.set(data));
    const d = line(el)?.getAttribute('d') ?? '';
    expect(d.match(/M/g)?.length).toBe(2);
    expect(d).not.toContain('NaN');
    expect(el.querySelectorAll('[data-slot="chart-dot"]').length).toBe(5);
    const series = fixture.debugElement.query((d) => d.attributes['ivLine'] !== undefined).injector.get(IV_SERIES);
    expect(series.items().map((i) => i.index)).toEqual([0, 1, 3, 4, 5]);
  });

  it('renders the frame with empty data and no NaN', async () => {
    for (const type of [AreaHost, LineHost] as const) {
      const { el, svg } = await render<AreaHost | LineHost>(type, (h) => h.data.set([]));
      expect(svg).not.toBeNull();
      expect(el.querySelector('[data-slot="chart-x-axis"]')).not.toBeNull();
      expect(el.querySelectorAll('path[data-slot^="chart-"]').length).toBe(0);
      expect(el.outerHTML).not.toContain('NaN');
    }
  });

  it('has no NaN anywhere with data', async () => {
    for (const type of [AreaHost, LineHost] as const) {
      const { el } = await render<AreaHost | LineHost>(type);
      expect(el.outerHTML).not.toContain('NaN');
    }
  });

  it('is an image with a label', async () => {
    const { svg } = await render(AreaHost);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Visitors by month');
    expect(svg.getAttribute('viewBox')).toBe('0 0 320 200');
  });

  it('has no axe violations', async () => {
    for (const type of [AreaHost, LineHost, ExpandHost] as const) {
      const { fixture } = await render<AreaHost | LineHost | ExpandHost>(type);
      await expect(fixture.nativeElement).toHaveNoViolations();
    }
  });
});

// Many rows, for minTickGap (the 90-day toggle in chart-bar-interactive).
const DAYS: IvChartDatum[] = Array.from({ length: 90 }, (_, i) => ({ date: `Day ${i + 1}`, desktop: (i * 37) % 400 }));

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data()">
        <g ivXAxis dataKey="date" [minTickGap]="minTickGap()" [height]="height()" />
        <g ivYAxis [tickCount]="tickCount()" />
        <g ivBar dataKey="desktop" />
      </svg>
    </iv-chart>
  `,
})
class AxisHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(DAYS);
  minTickGap = signal(32);
  height = signal(30);
  tickCount = signal(5);
}

describe('Cartesian axes', () => {
  const xTicks = (el: Element) => Array.from(el.querySelectorAll('[data-slot="chart-x-axis"] .iv-chart-tick text'));

  it('hides category ticks closer than minTickGap', async () => {
    const { el } = await render(AxisHost);
    const xs = xTicks(el).map((t) => Number(t.getAttribute('x')));
    expect(xs.length).toBeGreaterThan(1);
    expect(xs.length).toBeLessThan(90);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(32);
    // The last row keeps its label (Recharts' preserveEnd).
    expect(xTicks(el).at(-1)?.textContent?.trim()).toBe('Day 90');
  });

  it('shows every tick when there is room (default minTickGap 5)', async () => {
    const { el } = await render(AxisHost, (h) => {
      h.data.set(DAYS.slice(0, 6));
      h.minTickGap.set(5);
    });
    expect(xTicks(el).length).toBe(6);
  });

  it('uses tickCount for value ticks and the grid', async () => {
    const { el } = await render(AxisHost, (h) => {
      h.data.set(MONTHS);
      h.tickCount.set(3);
    });
    const labels = Array.from(el.querySelectorAll('[data-slot="chart-y-axis"] .iv-chart-tick text'));
    expect(labels.map((t) => t.textContent?.trim())).toEqual(['0', '100', '200', '300', '400']);
  });

  it('reserves the X axis height', async () => {
    const { fixture } = await render(AxisHost, (h) => h.height.set(50));
    const ctx = fixture.debugElement.query((d) => d.name === 'svg').injector.get(IV_CARTESIAN);
    expect(ctx.plot().height).toBe(200 - 5 - 5 - 50);
  });
});
