import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  IV_CHART_IMPORTS,
  IV_POLAR,
  IV_SERIES,
  IvChartConfig,
  IvChartDatum,
  IvSeriesContext,
  ivArc,
} from '@inlaylab/ivorie/chart';

const SIZE = { width: 300, height: 300 };

// shadcn chart-pie-simple, without the `fill` column.
const BROWSERS: IvChartDatum[] = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

// shadcn chart-radar-default.
const MONTHS: IvChartDatum[] = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 273 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
];

const CONFIG: IvChartConfig = {
  visitors: { label: 'Visitors' },
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
  firefox: { label: 'Firefox', color: 'var(--chart-3)' },
  edge: { label: 'Edge', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' },
};

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivPieChart>
        <g
          ivPie
          [data]="data()"
          dataKey="visitors"
          nameKey="browser"
          [activeIndex]="activeIndex()"
        />
      </svg>
    </iv-chart>
  `,
})
class PieHost {
  config = CONFIG;
  size = SIZE;
  data = signal<IvChartDatum[]>(BROWSERS);
  activeIndex = signal<number | undefined>(undefined);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivPieChart>
        <g
          ivPie
          [data]="data"
          dataKey="visitors"
          nameKey="browser"
          [innerRadius]="60"
          [strokeWidth]="5"
        >
          <ng-template ivChartLabel let-box>
            <svg:text data-testid="center" [attr.x]="box.cx" [attr.y]="box.cy" text-anchor="middle">
              1,125
            </svg:text>
          </ng-template>
        </g>
      </svg>
    </iv-chart>
  `,
})
class DonutHost {
  config = CONFIG;
  size = SIZE;
  data = BROWSERS;
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivPieChart>
        <g ivPie [data]="desktop" dataKey="desktop" [outerRadius]="60" />
        <g ivPie [data]="mobile" dataKey="mobile" [innerRadius]="70" [outerRadius]="90" />
      </svg>
    </iv-chart>
  `,
})
class StackedPieHost {
  config = CONFIG;
  size = SIZE;
  desktop = MONTHS.slice(0, 5).map((r, i) => ({ ...r, fill: `var(--chart-${i + 1})` }));
  mobile = MONTHS.slice(0, 5).map((r, i) => ({
    month: r['month'],
    mobile: 80 + i * 20,
    fill: `var(--chart-${i + 1})`,
  }));
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivPieChart>
        <g ivPie [data]="data" dataKey="visitors" [label]="true">
          <g ivLabelList dataKey="browser" [position]="position()" />
        </g>
      </svg>
    </iv-chart>
  `,
})
class PieLabelHost {
  config = CONFIG;
  size = SIZE;
  data = BROWSERS.map((r) => ({ ...r, fill: `var(--color-${r['browser']})` }));
  position = signal<'inside' | 'outside'>('inside');
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivRadarChart [data]="data">
        <g ivPolarAngleAxis dataKey="month" />
        <g ivPolarGrid [gridType]="gridType()" class="fill-muted" />
        <g ivRadar dataKey="desktop" fill="var(--color-desktop)" [fillOpacity]="0.6" [dot]="true" />
      </svg>
    </iv-chart>
  `,
})
class RadarHost {
  config = CONFIG;
  size = SIZE;
  data: IvChartDatum[] = MONTHS;
  gridType = signal<'polygon' | 'circle'>('polygon');
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivRadialChart [data]="data" [innerRadius]="30" [outerRadius]="110">
        <g ivRadialBar dataKey="visitors" background />
      </svg>
    </iv-chart>
  `,
})
class RadialHost {
  config = CONFIG;
  size = SIZE;
  data: IvChartDatum[] = BROWSERS.map((r) => ({ ...r, fill: `var(--color-${r['browser']})` }));
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="size">
      <svg ivRadialChart [data]="data" [endAngle]="180" [innerRadius]="80" [outerRadius]="110">
        <g ivRadialBar dataKey="mobile" fill="var(--color-mobile)" stackId="a" [cornerRadius]="5" />
        <g
          ivRadialBar
          dataKey="desktop"
          fill="var(--color-desktop)"
          stackId="a"
          [cornerRadius]="5"
        />
        <g ivPolarRadiusAxis>
          <ng-template ivChartLabel let-cx="cx" let-cy="cy">
            <svg:text data-testid="center" [attr.x]="cx" [attr.y]="cy">1,830</svg:text>
          </ng-template>
        </g>
      </svg>
    </iv-chart>
  `,
})
class RadialStackedHost {
  config = CONFIG;
  size = SIZE;
  data = [{ month: 'january', mobile: 570, desktop: 1260 }];
}

// R14: bare boolean attributes, like shadcn's JSX.
@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data">
        <g ivCartesianGrid vertical="false" />
        <g ivXAxis dataKey="month" hide />
        <g ivYAxis hide />
        <g ivLine dataKey="desktop" dot />
      </svg>
    </iv-chart>
  `,
})
class BareHost {
  config = CONFIG;
  data = MONTHS;
}

async function render<T>(type: new () => T, patch?: (host: T) => void) {
  const fixture = TestBed.createComponent(type);
  patch?.(fixture.componentInstance);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const svg = fixture.debugElement.query((d) => d.name === 'svg');
  const polar = svg.injector.get(IV_POLAR, null);
  const series = (selector: string): IvSeriesContext[] =>
    fixture.debugElement
      .queryAll((d) => d.attributes[selector] !== undefined)
      .map((d) => d.injector.get(IV_SERIES));
  return { fixture, el, polar, series };
}

const sectors = (el: Element) =>
  Array.from(el.querySelectorAll('path[data-slot="chart-pie-sector"]'));
const radialBars = (el: Element) =>
  Array.from(el.querySelectorAll('path[data-slot="chart-radial-bar"]'));
const arcCount = (d: string | null) => (d?.match(/A/g) ?? []).length;
const sweep = (s: { startAngle?: number; endAngle?: number }) =>
  Math.abs(s.endAngle! - s.startAngle!);

describe('Pie chart', () => {
  it('draws a sector per row that together make a full circle', async () => {
    const { el, polar, series } = await render(PieHost);
    expect(sectors(el).length).toBe(5);
    expect(polar!.center()).toEqual({ cx: 150, cy: 150 });
    const items = series('ivPie')[0].items();
    expect(items.length).toBe(5);
    expect(items.reduce((sum, s) => sum + sweep(s), 0)).toBeCloseTo(360, 6);
    // Recharts angles: the first sector starts at 3 o'clock and goes counter-clockwise.
    expect(items[0].startAngle).toBeCloseTo(0, 6);
    expect(items[0].endAngle).toBeCloseTo((275 / 925) * 360, 6);
    expect(items[0].outerRadius).toBeCloseTo(145 * 0.8, 6);
    expect(items[0].innerRadius).toBe(0);
  });

  it('colors sectors by name when rows have no fill', async () => {
    const { el } = await render(PieHost);
    expect(sectors(el).map((s) => s.getAttribute('fill'))).toEqual([
      'var(--color-chrome)',
      'var(--color-safari)',
      'var(--color-firefox)',
      'var(--color-edge)',
      'var(--color-other)',
    ]);
    // shadcn: default sector outlines are transparent.
    expect(sectors(el).every((s) => s.classList.contains('iv-chart-sector'))).toBe(true);
  });

  it('marks the active sector', async () => {
    const { el } = await render(PieHost, (h) => h.activeIndex.set(2));
    expect(sectors(el).map((s) => s.hasAttribute('data-active'))).toEqual([
      false,
      false,
      true,
      false,
      false,
    ]);
  });

  it('draws a donut with inner arcs and a center label', async () => {
    const { el, series } = await render(DonutHost);
    const paths = sectors(el);
    expect(paths.length).toBe(5);
    for (const p of paths) expect(arcCount(p.getAttribute('d'))).toBeGreaterThanOrEqual(2);
    expect(paths[0].getAttribute('stroke-width')).toBe('5');
    expect(series('ivPie')[0].items()[0].innerRadius).toBe(60);
    const center = el.querySelector('[data-testid="center"]')!;
    expect(center.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(center.getAttribute('x')).toBe('150');
    expect(center.getAttribute('y')).toBe('150');
  });

  it('draws two pies as rings that do not overlap', async () => {
    const { el, series } = await render(StackedPieHost);
    expect(sectors(el).length).toBe(10);
    const [inner, outer] = series('ivPie').map((s) => s.items());
    expect(Math.max(...inner.map((s) => s.outerRadius!))).toBe(60);
    expect(Math.min(...outer.map((s) => s.innerRadius!))).toBe(70);
    expect(Math.max(...outer.map((s) => s.outerRadius!))).toBe(90);
    // Rows with a fill keep it.
    expect(sectors(el)[0].getAttribute('fill')).toBe('var(--chart-1)');
  });

  it('draws nothing when every value is 0', async () => {
    const { el } = await render(PieHost, (h) =>
      h.data.set(BROWSERS.map((r) => ({ ...r, visitors: 0 }))),
    );
    expect(sectors(el).length).toBe(0);
    expect(el.innerHTML).not.toContain('NaN');
  });

  it('skips a row with a null value', async () => {
    const data = BROWSERS.map((r, i) => (i === 1 ? { ...r, visitors: null } : r));
    const { el, series } = await render(PieHost, (h) => h.data.set(data));
    expect(sectors(el).length).toBe(4);
    const items = series('ivPie')[0].items();
    expect(items.map((s) => s.index)).toEqual([0, 2, 3, 4]);
    expect(items.reduce((sum, s) => sum + sweep(s), 0)).toBeCloseTo(360, 6);
    expect(el.innerHTML).not.toContain('NaN');
  });

  it('draws value labels with label lines', async () => {
    const { el } = await render(PieLabelHost);
    const labels = Array.from(el.querySelectorAll('[data-slot="chart-pie-label"]'));
    expect(labels.map((t) => t.textContent?.trim())).toEqual(['275', '200', '187', '173', '90']);
    expect(el.querySelectorAll('[data-slot="chart-pie-label-line"]').length).toBe(5);
    // The first sector's middle is up and right of the center: the label starts there.
    expect(labels[0].getAttribute('text-anchor')).toBe('start');
  });

  it('places label list text at the sector centroid or outside it', async () => {
    const { fixture, el, series } = await render(PieLabelHost);
    const items = series('ivPie')[0].items();
    const texts = () => Array.from(el.querySelectorAll('[data-slot="chart-label-list"] text'));
    expect(texts().map((t) => t.textContent?.trim())).toEqual([
      'chrome',
      'safari',
      'firefox',
      'edge',
      'other',
    ]);
    const at = (r: number, angle: number) => [
      150 + r * Math.cos((-angle * Math.PI) / 180),
      150 + r * Math.sin((-angle * Math.PI) / 180),
    ];

    const [x, y] = at(items[0].outerRadius! / 2, items[0].midAngle!);
    expect(Number(texts()[0].getAttribute('x'))).toBeCloseTo(x, 3);
    expect(Number(texts()[0].getAttribute('y'))).toBeCloseTo(y, 3);
    expect(texts()[0].getAttribute('text-anchor')).toBe('middle');

    fixture.componentInstance.position.set('outside');
    await fixture.whenStable();
    const [ox, oy] = at(items[0].outerRadius! + 12, items[0].midAngle!);
    expect(Number(texts()[0].getAttribute('x'))).toBeCloseTo(ox, 3);
    expect(Number(texts()[0].getAttribute('y'))).toBeCloseTo(oy, 3);
    expect(texts()[0].getAttribute('text-anchor')).toBe('start');
    // "safari" sits left of the center.
    expect(items[1].midAngle! > 90 && items[1].midAngle! < 270).toBe(true);
    expect(texts()[1].getAttribute('text-anchor')).toBe('end');
  });

  it('has no axe violations', async () => {
    const { fixture } = await render(DonutHost);
    const svg = fixture.nativeElement.querySelector('svg')!;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Pie chart: Visitors');
    await expect(fixture.nativeElement).toHaveNoViolations();
  });
});

describe('Radar chart', () => {
  it('draws one polygon with a vertex per row, the first at the top', async () => {
    const { el, polar } = await render(RadarHost);
    const radar = el.querySelectorAll('path[data-slot="chart-radar"]');
    expect(radar.length).toBe(1);
    const d = radar[0].getAttribute('d')!;
    expect((d.match(/[ML]/g) ?? []).length).toBe(6);
    expect(d).toMatch(/Z$/);
    const [x, y] = d.slice(1).split(/[LZ]/)[0].split(',').map(Number);
    expect(x).toBeCloseTo(150, 6);
    // 186 on a 0–400 radius scale over 116px.
    expect(y).toBeCloseTo(150 - (186 / 400) * 116, 6);
    expect(polar!.angles()).toEqual({ start: 90, end: -270 });
    expect(el.querySelectorAll('[data-slot="chart-dot"]').length).toBe(6);
    expect(el.innerHTML).not.toContain('NaN');
  });

  it('draws a polygon grid with a radial line per row and angle labels', async () => {
    const { el, polar } = await render(RadarHost);
    const grid = el.querySelector('[data-slot="chart-polar-grid"]')!;
    expect(grid.classList.contains('iv-chart-polar-grid')).toBe(true);
    expect(grid.querySelectorAll('line').length).toBe(6);
    expect(grid.querySelectorAll('path[data-slot="chart-polar-grid-polygon"]').length).toBe(4);
    expect(polar!.angleKey()).toBe('month');
    const ticks = Array.from(el.querySelectorAll('[data-slot="chart-polar-angle-axis"] text'));
    expect(ticks.map((t) => t.textContent?.trim())).toEqual(MONTHS.map((r) => r['month']));
    expect(ticks[0].getAttribute('text-anchor')).toBe('middle');
    expect(ticks[1].getAttribute('text-anchor')).toBe('start');
    expect(ticks[4].getAttribute('text-anchor')).toBe('end');
  });

  it('draws circle rings with gridType="circle"', async () => {
    const { el } = await render(RadarHost, (h) => h.gridType.set('circle'));
    const grid = el.querySelector('[data-slot="chart-polar-grid"]')!;
    expect(grid.querySelectorAll('circle').length).toBe(4);
    expect(grid.querySelectorAll('path').length).toBe(0);
    // Like Recharts, `class` goes on each ring (so `first:fill-muted` works), not on the group.
    expect(grid.classList.contains('fill-muted')).toBe(false);
    expect(
      Array.from(grid.querySelectorAll('circle')).every((c) => c.classList.contains('fill-muted')),
    ).toBe(true);
  });

  it('draws no series and no NaN with no rows', async () => {
    const { el } = await render(RadarHost, (h) => (h.data = []));
    expect(el.querySelectorAll('path[data-slot="chart-radar"]').length).toBe(0);
    expect(el.querySelectorAll('[data-slot="chart-polar-angle-axis"] text').length).toBe(0);
    expect(el.innerHTML).not.toContain('NaN');
    const radial = await render(RadialHost, (h) => (h.data = []));
    expect(radialBars(radial.el).length).toBe(0);
    expect(radial.el.innerHTML).not.toContain('NaN');
  });

  it('has no axe violations', async () => {
    const { fixture } = await render(RadarHost);
    expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-label')).toBe(
      'Radar chart: Desktop',
    );
    await expect(fixture.nativeElement).toHaveNoViolations();
  });
});

describe('Radial chart', () => {
  it('draws an arc per row on its own ring, with muted tracks', async () => {
    const { el, series } = await render(RadialHost);
    expect(radialBars(el).length).toBe(5);
    const tracks = el.querySelectorAll('path.iv-chart-radial-background');
    expect(tracks.length).toBe(5);
    const items = series('ivRadialBar')[0].items();
    // The first row is the inner ring; rings do not overlap.
    for (let i = 1; i < items.length; i++)
      expect(items[i].innerRadius!).toBeGreaterThan(items[i - 1].outerRadius!);
    expect(items[0].innerRadius!).toBeGreaterThanOrEqual(30);
    expect(items[4].outerRadius!).toBeLessThanOrEqual(110);
    // The largest value fills the whole sweep; the rest scale linearly from 0.
    expect(items[0].startAngle).toBe(0);
    expect(items[0].endAngle).toBeCloseTo(360, 6);
    expect(items[4].endAngle).toBeCloseTo((90 / 275) * 360, 6);
    expect(radialBars(el)[0].getAttribute('fill')).toBe('var(--color-chrome)');
    expect(el.innerHTML).not.toContain('NaN');
  });

  it('draws square bar ends unless cornerRadius is set (Recharts default 0)', async () => {
    const square = await render(RadialHost);
    // An annular sector without rounding: the outer and the inner arc only.
    expect(arcCount(radialBars(square.el)[1].getAttribute('d'))).toBe(2);
    const rounded = await render(RadialStackedHost);
    expect(arcCount(radialBars(rounded.el)[0].getAttribute('d'))).toBeGreaterThan(2);
  });

  it('stacks bars with a stackId on one track', async () => {
    const { el, series } = await render(RadialStackedHost);
    expect(radialBars(el).length).toBe(2);
    const [mobile, desktop] = series('ivRadialBar').map((s) => s.items()[0]);
    expect(mobile.innerRadius).toBe(desktop.innerRadius);
    expect(mobile.outerRadius).toBe(desktop.outerRadius);
    expect(mobile.startAngle).toBe(0);
    expect(desktop.startAngle).toBeCloseTo(mobile.endAngle!, 6);
    expect(desktop.endAngle).toBeCloseTo(180, 6);
    const center = el.querySelector('[data-testid="center"]')!;
    expect(center.getAttribute('x')).toBe('150');
    expect(center.getAttribute('y')).toBe('150');
  });

  it('has no axe violations', async () => {
    for (const type of [RadialHost, RadialStackedHost] as const) {
      const { fixture } = await render<RadialHost | RadialStackedHost>(type);
      expect(fixture.nativeElement.querySelector('svg').getAttribute('role')).toBe('img');
      await expect(fixture.nativeElement).toHaveNoViolations();
    }
  });
});

describe('ivArc', () => {
  it('draws a quarter sector with an arc command', () => {
    const shape = {
      cx: 100,
      cy: 100,
      innerRadius: 0,
      outerRadius: 50,
      startAngle: 0,
      endAngle: 90,
      fill: 'red',
      index: 0,
    };
    const d = ivArc(shape);
    expect(d).toContain('A');
    // From 3 o'clock (150, 100) counter-clockwise to 12 o'clock (100, 50), through the center.
    expect(d).toMatch(/^M150,100A50,50,0,0,0,100,50L100,100Z$/);
    expect(ivArc({ ...shape, innerRadius: 20 }, 4)).not.toContain('NaN');
    expect(ivArc({ ...shape, outerRadius: Number.NaN })).not.toContain('NaN');
  });
});

describe('Boolean attributes', () => {
  it('accepts a bare attribute like shadcn JSX', async () => {
    const { el } = await render(BareHost);
    expect(el.querySelector('[data-slot="chart-x-axis"] text')).toBeNull();
    expect(el.querySelector('[data-slot="chart-y-axis"] text')).toBeNull();
    expect(el.querySelectorAll('[data-slot="chart-dot"]').length).toBe(6);
    expect(
      el.querySelectorAll('[data-slot="chart-grid"] line[data-direction="vertical"]').length,
    ).toBe(0);
    const radial = await render(RadialHost);
    expect(radial.el.querySelectorAll('path.iv-chart-radial-background').length).toBe(5);
  });
});
