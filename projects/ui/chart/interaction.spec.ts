import { Component, DOCUMENT, getPlatform, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bootstrapApplication } from '@angular/platform-browser';
import { platformBrowserTesting } from '@angular/platform-browser/testing';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { describe, expect, it } from 'vitest';
import {
  IV_CARTESIAN,
  IV_CHART,
  IV_CHART_IMPORTS,
  IV_POLAR,
  IV_SERIES,
  IvChartConfig,
  IvChartContext,
  IvChartDatum,
  IvChartPayload,
  IvSectorShape,
  IvSeriesContext,
  ivArc,
} from '@inlaylab/ivorie/chart';

// shadcn chart-bar-multiple.
const MONTHS: IvChartDatum[] = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const BROWSERS: IvChartDatum[] = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
  { browser: 'other', visitors: 90 },
];

@Component({ selector: 'test-icon', template: `<svg data-testid="icon"></svg>` })
class TestIcon {}

const CONFIG: IvChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  visitors: { label: 'Visitors' },
  chrome: { label: 'Chrome', color: 'var(--chart-1)' },
  safari: { label: 'Safari', color: 'var(--chart-2)' },
  firefox: { label: 'Firefox', color: 'var(--chart-3)' },
  edge: { label: 'Edge', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' },
};

/** 90 days, like shadcn chart-area-interactive. */
const DAYS: IvChartDatum[] = Array.from({ length: 90 }, (_, i) => ({
  date: `2024-04-${String(i + 1).padStart(2, '0')}`,
  desktop: 100 + i,
  mobile: 50 + i,
}));

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data()" [layout]="layout()">
        @if (layout() === 'horizontal') {
          <g ivXAxis dataKey="month" />
        } @else {
          <g ivXAxis type="number" hide />
          <g ivYAxis type="category" dataKey="month" />
        }
        <g ivBar dataKey="desktop" />
        <g ivBar dataKey="mobile" />
      </svg>
      <iv-chart-tooltip
        [indicator]="indicator()"
        [hideLabel]="hideLabel()"
        [cursor]="cursor()"
        [defaultIndex]="defaultIndex()"
        [formatter]="formatter()"
        [labelFormatter]="labelFormatter()"
      />
      @if (legend()) {
        <iv-chart-legend />
      }
    </iv-chart>
  `,
})
class BarHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(MONTHS);
  layout = signal<'horizontal' | 'vertical'>('horizontal');
  indicator = signal<'dot' | 'line' | 'dashed'>('dot');
  hideLabel = signal(false);
  cursor = signal(true);
  defaultIndex = signal<number | undefined>(undefined);
  formatter = signal<((value: unknown, name: string) => string) | undefined>(undefined);
  labelFormatter = signal<((label: unknown, payload: IvChartPayload[]) => string) | undefined>(
    undefined,
  );
  legend = signal(false);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivAreaChart [data]="data()">
        <g ivXAxis dataKey="date" />
        <g ivArea dataKey="mobile" stackId="a" />
        <g ivArea dataKey="desktop" stackId="a" />
      </svg>
      <iv-chart-tooltip [cursor]="cursor()" />
    </iv-chart>
  `,
})
class AreaHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(DAYS);
  cursor = signal(true);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="{ width: 300, height: 300 }">
      <svg ivPieChart>
        <g
          ivPie
          [data]="browsers"
          dataKey="visitors"
          nameKey="browser"
          [innerRadius]="60"
          [activeIndex]="activeIndex()"
        >
          <ng-template ivActiveShape let-shape>
            <svg:path data-testid="active-shape" [attr.d]="grow(shape)" [attr.fill]="shape.fill" />
          </ng-template>
        </g>
      </svg>
      <iv-chart-tooltip hideLabel />
    </iv-chart>
  `,
})
class PieActiveHost {
  config = CONFIG;
  browsers = BROWSERS;
  activeIndex = signal<number | undefined>(2);
  grow = (shape: IvSectorShape) => ivArc({ ...shape, outerRadius: shape.outerRadius + 10 });
}

// shadcn chart-pie-stacked: two rings.
@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="{ width: 300, height: 300 }">
      <svg ivPieChart>
        <g ivPie [data]="desktop" dataKey="desktop" nameKey="month" [outerRadius]="60" />
        <g
          ivPie
          [data]="mobile"
          dataKey="mobile"
          nameKey="month"
          [innerRadius]="70"
          [outerRadius]="90"
        />
      </svg>
      <iv-chart-tooltip
        [labelFormatter]="ringLabel"
        nameKey="month"
        indicator="line"
        [defaultIndex]="defaultIndex()"
      />
      <iv-chart-legend nameKey="month" />
    </iv-chart>
  `,
})
class PieStackedHost {
  config: IvChartConfig = {
    ...CONFIG,
    january: { label: 'January', color: 'var(--chart-1)' },
    february: { label: 'February', color: 'var(--chart-2)' },
    march: { label: 'March', color: 'var(--chart-3)' },
  };
  desktop = [
    { month: 'january', desktop: 186, fill: 'var(--color-january)' },
    { month: 'february', desktop: 305, fill: 'var(--color-february)' },
    { month: 'march', desktop: 237, fill: 'var(--color-march)' },
  ];
  mobile = [
    { month: 'january', mobile: 80, fill: 'var(--color-january)' },
    { month: 'february', mobile: 200, fill: 'var(--color-february)' },
    { month: 'march', mobile: 120, fill: 'var(--color-march)' },
  ];
  defaultIndex = signal<number | undefined>(undefined);
  ringLabel = (_: unknown, payload: IvChartPayload[]) => this.config[payload[0].key]?.label ?? '';
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="{ width: 300, height: 300 }">
      <svg ivRadialChart [data]="data" [innerRadius]="30" [outerRadius]="110">
        <g ivRadialBar dataKey="visitors" background />
      </svg>
      <iv-chart-tooltip hideLabel nameKey="browser" />
    </iv-chart>
  `,
})
class RadialHost {
  config = CONFIG;
  data = BROWSERS.map((r) => ({ ...r, fill: `var(--color-${r['browser']})` }));
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config" [initialDimension]="{ width: 300, height: 300 }">
      <svg ivRadarChart [data]="data">
        <g ivPolarAngleAxis dataKey="month" />
        <g ivRadar dataKey="desktop" />
        <g ivRadar dataKey="mobile" />
      </svg>
      <iv-chart-tooltip indicator="line" />
      <iv-chart-legend />
    </iv-chart>
  `,
})
class RadarHost {
  config = CONFIG;
  data = MONTHS;
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivLineChart [data]="data">
        <g ivXAxis dataKey="month" />
        <g ivLine dataKey="desktop" />
      </svg>
      <iv-chart-legend [hideIcon]="hideIcon()" verticalAlign="top" />
    </iv-chart>
  `,
})
class IconLegendHost {
  config: IvChartConfig = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)', icon: TestIcon },
  };
  data = MONTHS;
  hideIcon = signal(false);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data">
        <g ivXAxis dataKey="month" />
        <g ivBar dataKey="desktop" />
      </svg>
      <iv-chart-tooltip>
        <ng-template ivChartTooltipContent let-payload let-label="label">
          <span data-testid="custom">{{ label }}: {{ payload[0].value }}</span>
        </ng-template>
      </iv-chart-tooltip>
    </iv-chart>
  `,
})
class CustomBodyHost {
  config = CONFIG;
  data = MONTHS;
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data">
        <g ivXAxis dataKey="month" />
        <g ivBar dataKey="desktop" stackId="a" />
        <g ivBar dataKey="mobile" stackId="a" />
      </svg>
      <iv-chart-tooltip hideLabel [defaultIndex]="1">
        <ng-template ivChartTooltipItem let-item let-label="label" let-index="index" let-all="payload">
          <span data-testid="row">{{ label }}={{ item.value }}</span>
          @if (index === all.length - 1) {
            <span data-testid="total">{{ total(item.row) }}</span>
          }
        </ng-template>
      </iv-chart-tooltip>
    </iv-chart>
  `,
})
class CustomItemHost {
  config = CONFIG;
  data = MONTHS;
  total = (row: IvChartDatum) => Number(row['desktop']) + Number(row['mobile']);
}

// shadcn chart-pie-legend: the pie has no nameKey; the legend names sectors by `browser`.
@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivPieChart>
        <g ivPie [data]="data" dataKey="visitors" />
      </svg>
      <iv-chart-legend nameKey="browser" />
    </iv-chart>
  `,
})
class PieLegendHost {
  config = CONFIG;
  data = BROWSERS;
}

async function render<T>(type: new () => T, patch?: (host: T) => void) {
  const fixture = TestBed.createComponent(type);
  patch?.(fixture.componentInstance);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const svgDebug = fixture.debugElement.query(
    (d) => d.name === 'svg' && d.injector.get(IV_CHART, null) !== null,
  );
  const svg = svgDebug.nativeElement as SVGSVGElement;
  const chart: IvChartContext = svgDebug.injector.get(IV_CHART);
  const series = (selector: string): IvSeriesContext[] =>
    fixture.debugElement
      .queryAll((d) => d.attributes[selector] !== undefined)
      .map((d) => d.injector.get(IV_SERIES));
  const stable = () => fixture.whenStable();
  const pointer = async (type: string, x: number, y: number, pointerType = 'mouse') => {
    svg.dispatchEvent(
      new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerType }),
    );
    await stable();
  };
  const key = async (name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    svg.dispatchEvent(event);
    await stable();
    return event;
  };
  return { fixture, el, svg, svgDebug, chart, series, pointer, key, stable };
}

const card = (el: Element) => el.querySelector<HTMLElement>('iv-chart-tooltip .cn-chart-tooltip');
const rows = (el: Element) =>
  Array.from(el.querySelectorAll<HTMLElement>('[data-slot="chart-tooltip-item"]'));
const label = (el: Element) => el.querySelector<HTMLElement>('[data-slot="chart-tooltip-label"]');
const indicators = (el: Element) =>
  Array.from(el.querySelectorAll<HTMLElement>('[data-slot="chart-tooltip-indicator"]'));
/** The text nodes under `node`, trimmed and joined by one space. */
function text(node: Element | null): string {
  if (!node) return '';
  const walker = node.ownerDocument.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent?.replace(/\s+/g, ' ').trim();
    if (t) parts.push(t);
  }
  return parts.join(' ');
}
const hasClasses = (el: Element, classes: string) =>
  classes.split(' ').every((c) => el.classList.contains(c));

describe('Chart tooltip', () => {
  it('opens on the band under the pointer, with a row per series and a muted cursor', async () => {
    const { el, chart, pointer } = await render(BarHost);
    expect(card(el)).toBeNull();
    // 320 wide, 5px margin: 6 bands of ~51.7px from x=5. Band 2 is 108–160.
    await pointer('pointermove', 130, 80);
    expect(chart.active()?.index).toBe(2);
    const tooltip = card(el)!;
    expect(hasClasses(tooltip, 'cn-chart-tooltip grid min-w-32 items-start')).toBe(true);
    expect(text(label(el))).toBe('March');
    expect(rows(el).map(text)).toEqual(['Desktop 237', 'Mobile 120']);
    const [dot] = indicators(el);
    expect(hasClasses(dot, 'shrink-0 rounded-[2px] bg-(--color-bg) h-2.5 w-2.5')).toBe(true);
    expect(dot.style.getPropertyValue('--color-bg')).toBe('var(--color-desktop)');
    const cursor = el.querySelector('rect.iv-chart-cursor-rect')!;
    expect(cursor.getAttribute('class')).toContain('fill-muted');
    expect(Number(cursor.getAttribute('x'))).toBeCloseTo(5 + (310 / 6) * 2, 3);
    // Bars of the band are active.
    const active = el.querySelectorAll('path[data-slot="chart-bar"][data-active]');
    expect(active.length).toBe(2);
  });

  it('follows the pointer and hides when it leaves', async () => {
    const { el, chart, pointer } = await render(BarHost);
    await pointer('pointermove', 20, 80);
    expect(chart.active()).toMatchObject({ index: 0, x: 20, y: 80 });
    await pointer('pointermove', 310, 80);
    expect(chart.active()?.index).toBe(5);
    await pointer('pointerleave', 400, 80);
    expect(chart.active()).toBeNull();
    expect(card(el)).toBeNull();
    expect(el.querySelector('rect.iv-chart-cursor-rect')).toBeNull();
  });

  it('opens on a touch and stays after the finger lifts', async () => {
    const { el, chart, pointer } = await render(BarHost);
    await pointer('pointerdown', 130, 80, 'touch');
    expect(chart.active()?.index).toBe(2);
    await pointer('pointerleave', 130, 80, 'touch');
    expect(card(el)).not.toBeNull();
  });

  it('ignores the pointer outside the plot', async () => {
    const { chart, pointer } = await render(BarHost);
    // The x axis takes 30px under the plot (y 165–195).
    await pointer('pointermove', 130, 185);
    expect(chart.active()).toBeNull();
  });

  it('draws a line or dashed indicator and can hide the label', async () => {
    const { el, fixture, pointer, stable } = await render(BarHost, (h) => h.indicator.set('line'));
    await pointer('pointermove', 130, 80);
    expect(indicators(el)[0].classList).toContain('w-1');
    expect(indicators(el)[0].classList).not.toContain('h-2.5');
    fixture.componentInstance.indicator.set('dashed');
    await stable();
    expect(hasClasses(indicators(el)[0], 'w-0 border-dashed bg-transparent')).toBe(true);
    fixture.componentInstance.hideLabel.set(true);
    await stable();
    expect(label(el)).toBeNull();
    expect(rows(el).length).toBe(2);
  });

  it('shows formatter and labelFormatter output', async () => {
    const { el, pointer } = await render(BarHost, (h) => {
      h.formatter.set((value, name) => `${name}: ${value} kcal`);
      h.labelFormatter.set((value, payload) => `${value} (${payload.length})`);
    });
    await pointer('pointermove', 130, 80);
    expect(text(label(el))).toBe('March (2)');
    expect(rows(el).map(text)).toEqual(['desktop: 237 kcal', 'mobile: 120 kcal']);
    expect(indicators(el).length).toBe(0);
  });

  it('renders a custom body from ivChartTooltipContent', async () => {
    const { el, pointer } = await render(CustomBodyHost);
    await pointer('pointermove', 130, 80);
    expect(text(el.querySelector('[data-testid="custom"]'))).toBe('March: 237');
    expect(card(el)!.contains(el.querySelector('[data-testid="custom"]'))).toBe(true);
  });

  it('renders each row from ivChartTooltipItem, inside the row box', async () => {
    const { el } = await render(CustomItemHost);
    expect(rows(el).map(text)).toEqual(['Desktop=305', 'Mobile=200 505']);
    expect(rows(el)[1].querySelector('[data-testid="total"]')).not.toBeNull();
    // The template replaces the default indicator, name and value.
    expect(indicators(el).length).toBe(0);
    expect(el.querySelectorAll('[data-testid="total"]').length).toBe(1);
  });

  it('opens on defaultIndex on the first render', async () => {
    const { el, chart } = await render(BarHost, (h) => h.defaultIndex.set(1));
    expect(chart.active()?.index).toBe(1);
    expect(text(label(el))).toBe('February');
    expect(rows(el).map(text)).toEqual(['Desktop 305', 'Mobile 200']);
  });

  it('cursor=false draws no cursor but keeps the tooltip', async () => {
    const { el, pointer } = await render(BarHost, (h) => h.cursor.set(false));
    await pointer('pointermove', 130, 80);
    expect(card(el)).not.toBeNull();
    expect(el.querySelector('.iv-chart-cursor-rect')).toBeNull();
  });

  it('draws a cursor line on line and area charts', async () => {
    const { el, pointer } = await render(AreaHost);
    await pointer('pointermove', 100, 80);
    const line = el.querySelector('line.iv-chart-cursor-line')!;
    expect(line.getAttribute('class')).toContain('stroke-border');
    expect(line.getAttribute('x1')).toBe(line.getAttribute('x2'));
    // Stacked areas list in markup order, and the active dots show.
    expect(rows(el).map((r) => text(r).split(' ')[0])).toEqual(['Mobile', 'Desktop']);
    expect(el.querySelectorAll('[data-slot="chart-active-dot"]').length).toBe(2);
  });

  it('keeps the tooltip inside the chart box', async () => {
    const { el, pointer } = await render(BarHost);
    const host = el.querySelector<HTMLElement>('iv-chart-tooltip')!;
    await pointer('pointermove', 20, 20);
    const left = host.style.transform;
    // Left half: 10px right of the pointer.
    expect(left).toContain('30px');
    await pointer('pointermove', 310, 150);
    // Right half: the tooltip sits left of the pointer.
    expect(host.style.transform).toContain('100%');
    expect(host.style.transform).not.toBe(left);
  });
});

describe('Chart keyboard', () => {
  it('is one tab stop; arrows move the active row and wrap, Home and End jump, Escape hides', async () => {
    const { el, svg, chart, key } = await render(BarHost);
    expect(svg.getAttribute('tabindex')).toBe('0');
    // A visible ring for keyboard focus (WCAG 2.4.7); the container only hides other outlines.
    expect(hasClasses(svg, 'focus-visible:outline-[3px] focus-visible:outline-ring/50')).toBe(true);
    const container = el.querySelector('[data-slot="chart"]')!;
    expect(container.classList).toContain('[&_svg:not(:focus-visible)]:outline-hidden');
    expect(container.classList).not.toContain('[&_svg]:outline-hidden');
    svg.focus();
    svg.dispatchEvent(new FocusEvent('focus'));
    expect((await key('ArrowRight')).defaultPrevented).toBe(true);
    await key('ArrowRight');
    expect(chart.active()?.index).toBe(1);
    expect(text(label(el))).toBe('February');
    const host = el.querySelector('iv-chart-tooltip')!;
    expect(host.getAttribute('aria-live')).toBe('polite');
    await key('End');
    expect(chart.active()?.index).toBe(5);
    await key('ArrowRight');
    expect(chart.active()?.index).toBe(0);
    await key('ArrowLeft');
    expect(chart.active()?.index).toBe(5);
    await key('Home');
    expect(chart.active()?.index).toBe(0);
    await key('Escape');
    expect(chart.active()).toBeNull();
    expect(card(el)).toBeNull();
  });

  it('starts from the end on ArrowLeft', async () => {
    const { chart, key } = await render(BarHost);
    await key('ArrowLeft');
    expect(chart.active()?.index).toBe(5);
  });

  it('uses ArrowDown and ArrowUp on a vertical layout', async () => {
    const { chart, key } = await render(BarHost, (h) => h.layout.set('vertical'));
    const right = await key('ArrowRight');
    expect(right.defaultPrevented).toBe(false);
    expect(chart.active()).toBeNull();
    await key('ArrowDown');
    await key('ArrowDown');
    expect(chart.active()?.index).toBe(1);
    await key('ArrowUp');
    expect(chart.active()?.index).toBe(0);
  });

  it('lets Escape through when nothing is active', async () => {
    const { key } = await render(BarHost);
    expect((await key('Escape')).defaultPrevented).toBe(false);
  });

  it('clears the active row on blur', async () => {
    const { svg, chart, key, stable } = await render(BarHost);
    svg.dispatchEvent(new FocusEvent('focus'));
    await key('ArrowRight');
    svg.dispatchEvent(new FocusEvent('blur'));
    await stable();
    expect(chart.active()).toBeNull();
  });

  it('walks the sectors of a pie with ArrowDown', async () => {
    const { chart, key } = await render(PieActiveHost, (h) => h.activeIndex.set(undefined));
    await key('ArrowDown');
    await key('ArrowDown');
    expect(chart.active()).toMatchObject({ index: 1, key: 'visitors' });
  });
});

describe('Chart data that shrinks', () => {
  it('clears the active row and hides the tooltip when its row goes away (90 → 7)', async () => {
    const { el, fixture, chart, stable } = await render(AreaHost);
    chart.active.set({ index: 50 });
    await stable();
    expect(text(label(el))).toBe('2024-04-51');
    fixture.componentInstance.data.set(DAYS.slice(-7));
    await stable();
    expect(chart.active()).toBeNull();
    expect(card(el)).toBeNull();
    expect(el.querySelectorAll('[data-slot="chart-active-dot"]').length).toBe(0);
    expect(el.innerHTML).not.toContain('NaN');
  });

  it('keeps an active row that still exists', async () => {
    const { fixture, chart, stable } = await render(AreaHost);
    chart.active.set({ index: 3 });
    await stable();
    fixture.componentInstance.data.set(DAYS.slice(-7));
    await stable();
    expect(chart.active()?.index).toBe(3);
  });

  it('never opens on empty data', async () => {
    const { el, fixture, key, pointer, stable } = await render(AreaHost);
    fixture.componentInstance.data.set([]);
    await stable();
    await key('ArrowRight');
    await pointer('pointermove', 100, 80);
    expect(card(el)).toBeNull();
    expect(el.innerHTML).not.toContain('NaN');
  });
});

describe('Polar interaction', () => {
  it('replaces the activeIndex sector with the ivActiveShape template and follows the signal', async () => {
    const { el, fixture, series, stable } = await render(PieActiveHost);
    const items = series('ivPie')[0].items();
    const grown = (i: number) =>
      ivArc({
        cx: items[i].cx!,
        cy: items[i].cy!,
        innerRadius: items[i].innerRadius!,
        startAngle: items[i].startAngle!,
        endAngle: items[i].endAngle!,
        outerRadius: items[i].outerRadius! + 10,
        fill: items[i].fill,
        index: i,
      });
    const shape = () => el.querySelector('[data-testid="active-shape"]')!;
    expect(el.querySelectorAll('path[data-slot="chart-pie-sector"]').length).toBe(4);
    expect(shape().getAttribute('d')).toBe(grown(2));
    expect(shape().getAttribute('fill')).toBe('var(--color-firefox)');
    fixture.componentInstance.activeIndex.set(4);
    await stable();
    expect(el.querySelectorAll('[data-testid="active-shape"]').length).toBe(1);
    expect(shape().getAttribute('d')).toBe(grown(4));
  });

  it('defaultIndex on two rings marks only the first ring, the one the tooltip shows', async () => {
    const { el, chart } = await render(PieStackedHost, (h) => h.defaultIndex.set(1));
    expect(chart.active()).toEqual({ index: 1 });
    const active = Array.from(
      el.querySelectorAll('path[data-slot="chart-pie-sector"][data-active]'),
    );
    expect(active.length).toBe(1);
    expect(active[0].closest('[ivPie]')?.getAttribute('dataKey')).toBe('desktop');
    expect(rows(el).map(text)).toEqual(['Desktop February 305']);
  });

  it('hovers a sector by angle and radius, and only in its own ring', async () => {
    const { el, chart, series, pointer } = await render(PieStackedHost);
    const [, outer] = series('ivPie');
    const item = outer.items()[1];
    const r = 80;
    const rad = (item.midAngle! * Math.PI) / 180;
    await pointer('pointermove', 150 + Math.cos(-rad) * r, 150 + Math.sin(-rad) * r);
    expect(chart.active()).toMatchObject({ index: 1, key: 'mobile' });
    const active = Array.from(
      el.querySelectorAll('path[data-slot="chart-pie-sector"][data-active]'),
    );
    expect(active.length).toBe(1);
    expect(active[0].closest('[ivPie]')?.getAttribute('dataKey')).toBe('mobile');
    // labelFormatter gets the payload; indicator="line" with one row nests the label.
    expect(rows(el).map(text)).toEqual(['Mobile February 200']);
    expect(indicators(el)[0].style.getPropertyValue('--color-bg')).toBe('var(--color-february)');
    // Between the rings: nothing.
    await pointer('pointermove', 150 + 65, 150);
    expect(chart.active()).toBeNull();
  });

  it('marks the active radial bar and shows its row', async () => {
    const { el, chart, polar, pointer } = await (async () => {
      const r = await render(RadialHost);
      return { ...r, polar: r.svgDebug.injector.get(IV_POLAR) };
    })();
    // Ring 1 of 5 between radius 30 and 110: 46–62.
    const { cx, cy } = polar.center();
    await pointer('pointermove', cx, cy - 54);
    expect(chart.active()?.index).toBe(1);
    const active = el.querySelectorAll('path[data-slot="chart-radial-bar"][data-active]');
    expect(active.length).toBe(1);
    expect(active[0].getAttribute('fill')).toBe('var(--color-safari)');
    expect(rows(el).map(text)).toEqual(['Safari 200']);
  });

  it('activates the nearest radar spoke and lists both series', async () => {
    const { el, chart, pointer } = await render(RadarHost);
    // Spoke 0 points up from the center (150, 150).
    await pointer('pointermove', 152, 60);
    expect(chart.active()?.index).toBe(0);
    expect(text(label(el))).toBe('January');
    expect(rows(el).map(text)).toEqual(['Desktop 186', 'Mobile 80']);
    expect(el.querySelector('line.iv-chart-cursor-line')).not.toBeNull();
  });
});

describe('Chart legend', () => {
  it('lists config labels in series order, under the plot', async () => {
    const { el } = await render(BarHost, (h) => h.legend.set(true));
    const legend = el.querySelector<HTMLElement>('iv-chart-legend')!;
    expect(hasClasses(legend, 'flex items-center justify-center gap-4 pt-3')).toBe(true);
    const items = Array.from(legend.querySelectorAll('[data-slot="chart-legend-item"]'));
    expect(items.map(text)).toEqual(['Desktop', 'Mobile']);
    const swatch = items[0].querySelector<HTMLElement>('.h-2.w-2')!;
    expect(hasClasses(swatch, 'shrink-0 rounded-[2px]')).toBe(true);
    expect(swatch.style.backgroundColor).toBe('var(--color-desktop)');
  });

  it('takes its space from the plot', async () => {
    const without = await render(BarHost);
    const before = without.svgDebug.injector.get(IV_CARTESIAN).plot();
    const withLegend = await render(BarHost, (h) => h.legend.set(true));
    const after = withLegend.svgDebug.injector.get(IV_CARTESIAN).plot();
    expect(after.y).toBe(before.y);
    expect(after.height).toBe(before.height - 28);
  });

  it('renders the config icon in place of the swatch, unless hideIcon', async () => {
    const { el, fixture, stable } = await render(IconLegendHost);
    const legend = el.querySelector<HTMLElement>('iv-chart-legend')!;
    expect(legend.classList).toContain('pb-3');
    expect(legend.querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(legend.querySelector('.h-2.w-2')).toBeNull();
    fixture.componentInstance.hideIcon.set(true);
    await stable();
    expect(legend.querySelector('[data-testid="icon"]')).toBeNull();
    expect(legend.querySelector('.h-2.w-2')).not.toBeNull();
  });

  it('lists pie sectors by nameKey', async () => {
    const { el } = await render(PieStackedHost);
    const items = Array.from(el.querySelectorAll('[data-slot="chart-legend-item"]'));
    expect(items.map(text)).toEqual(['January', 'February', 'March']);
  });

  it('lists every sector of a pie with no nameKey (chart-pie-legend)', async () => {
    const { el } = await render(PieLegendHost);
    const items = Array.from(el.querySelectorAll('[data-slot="chart-legend-item"]'));
    expect(items.map(text)).toEqual(['Chrome', 'Safari', 'Firefox', 'Edge', 'Other']);
  });

  it('lists radar series', async () => {
    const { el } = await render(RadarHost);
    const items = Array.from(el.querySelectorAll('[data-slot="chart-legend-item"]'));
    expect(items.map(text)).toEqual(['Desktop', 'Mobile']);
  });
});

describe('Chart interaction a11y', () => {
  it('has no axe violations with the tooltip open', async () => {
    const { el, pointer } = await render(BarHost, (h) => h.legend.set(true));
    await pointer('pointermove', 130, 80);
    expect(card(el)).not.toBeNull();
    await expect(el).toHaveNoViolations();
  });

  it('has no axe violations on an open pie tooltip', async () => {
    const { el, chart, stable } = await render(PieStackedHost);
    chart.active.set({ index: 0, key: 'desktop' });
    await stable();
    expect(card(el)).not.toBeNull();
    await expect(el).toHaveNoViolations();
  });
});

/**
 * Renders `root` with the real server platform. Its DOM emulation writes domino's DOM classes
 * (`Node`, `Event`, …) onto the global object, which the other specs in this worker share:
 * put every global back afterwards.
 */
async function renderOnServer(root: new () => unknown): Promise<string> {
  const g = globalThis as Record<string, unknown>;
  const saved = new Map(
    Object.getOwnPropertyNames(g).map((k) => [
      k,
      { d: Object.getOwnPropertyDescriptor(g, k)!, v: g[k] },
    ]),
  );
  try {
    return await renderApplication(
      (context) => bootstrapApplication(root, { providers: [provideServerRendering()] }, context),
      {
        document: '<!doctype html><html><head></head><body><app-root></app-root></body></html>',
        url: '/',
      },
    );
  } finally {
    for (const k of Object.getOwnPropertyNames(g)) if (!saved.has(k)) delete g[k];
    for (const [k, { d, v }] of saved) {
      if (g[k] === v) continue;
      // jsdom globals are accessors: the setter stores the value back.
      if (d.set) g[k] = v;
      else Object.defineProperty(g, k, d);
    }
    // The server render destroys the shared platform; its module state (the DOM adapter, core's
    // document) still points at the server's. A new browser platform puts both back: its
    // initializer sets the browser DOM adapter, and its DOCUMENT factory sets the document.
    if (!getPlatform()) platformBrowserTesting().injector.get(DOCUMENT);
  }
}

@Component({
  selector: 'app-root',
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data">
        <g ivXAxis dataKey="month" />
        <g ivBar dataKey="desktop" />
        <g ivBar dataKey="mobile" />
      </svg>
      <iv-chart-tooltip [defaultIndex]="1" />
    </iv-chart>
  `,
})
class ServerHost {
  config = CONFIG;
  data = MONTHS;
}

describe('Chart tooltip on the server', () => {
  it('renders the defaultIndex tooltip in the server output', async () => {
    const html = await renderOnServer(ServerHost);
    expect(html).toContain('cn-chart-tooltip');
    expect(html).toContain('February');
    expect(html).toMatch(/Desktop[\s\S]*305/);
    expect(html).toContain('data-active');
    // The rest of this worker still sees jsdom.
    expect(getPlatform()?.injector.get(DOCUMENT)).toBe(document);
    expect(TestBed.createComponent(BarHost).debugElement).not.toBeNull();
  });
});
