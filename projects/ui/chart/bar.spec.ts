import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  IV_CARTESIAN,
  IV_CHART_IMPORTS,
  IV_SERIES,
  IvChartConfig,
  IvChartDatum,
  IvSeriesContext,
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

// shadcn chart-bar-negative.
const NEGATIVE: IvChartDatum[] = [
  { month: 'January', visitors: 186 },
  { month: 'February', visitors: 205 },
  { month: 'March', visitors: -207 },
  { month: 'April', visitors: 173 },
  { month: 'May', visitors: -209 },
  { month: 'June', visitors: 214 },
];

const CONFIG: IvChartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
  visitors: { label: 'Visitors' },
};

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data()">
        <g ivCartesianGrid [vertical]="false" />
        <g ivXAxis dataKey="month" [tickLine]="false" [axisLine]="false" [tickMargin]="10" />
        <g ivBar dataKey="desktop" [stackId]="stackId()" [radius]="radius()" [activeIndex]="activeIndex()" />
        <g ivBar dataKey="mobile" [stackId]="stackId()" [radius]="4" />
      </svg>
    </iv-chart>
  `,
})
class MultipleHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(MONTHS);
  stackId = signal<string | undefined>(undefined);
  radius = signal<number | [number, number, number, number]>(4);
  activeIndex = signal<number | undefined>(undefined);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data" layout="vertical" [margin]="{ left: -20 }">
        <g ivXAxis type="number" dataKey="desktop" [hide]="true" />
        <g ivYAxis dataKey="month" type="category" [tickLine]="false" [axisLine]="false" />
        <g ivBar dataKey="desktop" [radius]="5" />
      </svg>
    </iv-chart>
  `,
})
class VerticalHost {
  config = CONFIG;
  data = MONTHS;
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data()">
        <g ivCartesianGrid [vertical]="false" />
        <g ivBar dataKey="visitors">
          <g ivLabelList position="top" dataKey="month" />
        </g>
      </svg>
    </iv-chart>
  `,
})
class NegativeHost {
  config = CONFIG;
  data = signal<IvChartDatum[]>(NEGATIVE);
}

@Component({
  imports: [IV_CHART_IMPORTS],
  template: `
    <iv-chart [config]="config">
      <svg ivBarChart [data]="data" [margin]="{ top: 20 }">
        <g ivXAxis dataKey="month" />
        <g ivBar dataKey="desktop" [radius]="8">
          <g ivLabelList position="top" [offset]="12" class="fill-foreground" [formatter]="formatter" />
        </g>
      </svg>
    </iv-chart>
  `,
})
class LabelHost {
  config = CONFIG;
  data = MONTHS;
  formatter = (value: number) => `${value} visits`;
}

async function render<T>(type: new () => T, patch?: (host: T) => void) {
  const fixture = TestBed.createComponent(type);
  patch?.(fixture.componentInstance);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const cartesian = fixture.debugElement.query((d) => d.name === 'svg').injector.get(IV_CARTESIAN);
  const series = (key: string): IvSeriesContext =>
    fixture.debugElement
      .queryAll((d) => d.attributes['ivBar'] !== undefined)
      .map((d) => d.injector.get(IV_SERIES))
      .find((s) => s.key === key)!;
  return { fixture, el, cartesian, series };
}

const bars = (el: Element) => Array.from(el.querySelectorAll('path[data-slot="chart-bar"]'));

describe('Bar chart', () => {
  it('draws two bars per row, side by side inside the band', async () => {
    const { el, cartesian, series } = await render(MultipleHost);
    expect(bars(el).length).toBe(12);
    const scale = cartesian.category()!.scale;
    const desktop = series('desktop').items();
    const mobile = series('mobile').items();
    expect(desktop.length).toBe(6);
    expect(mobile.length).toBe(6);
    for (let i = 0; i < 6; i++) {
      const start = scale(String(i))!;
      const end = start + scale.bandwidth();
      for (const bar of [desktop[i], mobile[i]]) {
        expect(bar.width).toBeGreaterThan(0);
        expect(bar.x).toBeGreaterThanOrEqual(start);
        expect(bar.x + bar.width).toBeLessThanOrEqual(end);
      }
      // Markup order: desktop on the left, then the bar gap.
      expect(mobile[i].x).toBeGreaterThanOrEqual(desktop[i].x + desktop[i].width);
      expect(desktop[i].payload).toBe(MONTHS[i]);
    }
  });

  it('uses barCategoryGap 10% and barGap 4 by default', async () => {
    const { cartesian, series } = await render(MultipleHost);
    const scale = cartesian.category()!.scale;
    const band = scale.bandwidth();
    const [d, m] = [series('desktop').items()[0], series('mobile').items()[0]];
    expect(d.x - scale('0')!).toBeCloseTo(band * 0.1);
    expect(m.x - (d.x + d.width)).toBeCloseTo(4);
  });

  it('stacks bars with the same stackId', async () => {
    const { el, series } = await render(MultipleHost, (h) => h.stackId.set('a'));
    expect(bars(el).length).toBe(12);
    const desktop = series('desktop').items();
    const mobile = series('mobile').items();
    for (let i = 0; i < 6; i++) {
      // The second bar's bottom is the first bar's top, in one slot.
      expect(mobile[i].y + mobile[i].height).toBeCloseTo(desktop[i].y);
      expect(mobile[i].x).toBeCloseTo(desktop[i].x);
      expect(mobile[i].width).toBeCloseTo(desktop[i].width);
    }
  });

  it('draws horizontal bars in a vertical layout', async () => {
    const { el, series, cartesian } = await render(VerticalHost);
    expect(bars(el).length).toBe(6);
    const items = series('desktop').items();
    const zero = cartesian.value()(0);
    const ratio = items[0].width / 186;
    items.forEach((bar, i) => {
      expect(bar.x).toBeCloseTo(zero);
      expect(bar.width).toBeCloseTo(ratio * (MONTHS[i]['desktop'] as number));
      expect(bar.height).toBeCloseTo(items[0].height);
      expect(bar.height).toBeGreaterThan(0);
    });
  });

  it('grows a negative bar down from the 0 line', async () => {
    const { el, series, cartesian } = await render(NegativeHost);
    const [lo, hi] = cartesian.value().domain();
    expect(lo).toBeLessThanOrEqual(-209);
    expect(hi).toBeGreaterThanOrEqual(214);
    const zero = cartesian.value()(0);
    const items = series('visitors').items();
    // Positive: ends at the 0 line. Negative: starts at the 0 line and grows down.
    expect(items[0].y + items[0].height).toBeCloseTo(zero);
    expect(items[2].y).toBeCloseTo(zero);
    expect(items[2].y + items[2].height).toBeCloseTo(cartesian.value()(-207));
    expect(items[2].height).toBeGreaterThan(0);
    expect(el.outerHTML).not.toContain('NaN');
  });

  it('includes 0 in the domain when all values are negative', async () => {
    const data = NEGATIVE.map((row) => ({ ...row, visitors: -Math.abs(row['visitors'] as number) }));
    const { cartesian } = await render(NegativeHost, (h) => h.data.set(data));
    expect(cartesian.value().domain()[1]).toBe(0);
  });

  it('colors a bar from its row fill', async () => {
    const data = MONTHS.map((row, i) => (i === 1 ? { ...row, fill: 'var(--chart-5)' } : row));
    const { el, series } = await render(MultipleHost, (h) => h.data.set(data));
    const desktop = bars(el.querySelector('[data-slot="chart-bar-series"]')!);
    expect(desktop[0].getAttribute('fill')).toBe('var(--color-desktop)');
    expect(desktop[1].getAttribute('fill')).toBe('var(--chart-5)');
    expect(series('desktop').items()[1].fill).toBe('var(--chart-5)');
  });

  it('rounds only the given corners with arcs', async () => {
    const { el } = await render(MultipleHost, (h) => h.radius.set([4, 4, 0, 0]));
    const d = bars(el)[0].getAttribute('d') ?? '';
    expect(d.match(/A/g)?.length).toBe(2);
    const all = bars(el)[6].getAttribute('d') ?? '';
    expect(all.match(/A/g)?.length).toBe(4);
    expect(bars(el)[0].hasAttribute('rx')).toBe(false);
  });

  it('marks the bar at activeIndex', async () => {
    const { el, fixture } = await render(MultipleHost);
    expect(el.querySelector('[data-slot="chart-bar"][data-active]')).toBeNull();
    fixture.componentInstance.activeIndex.set(2);
    await fixture.whenStable();
    const active = el.querySelectorAll('[data-slot="chart-bar"][data-active]');
    expect(active.length).toBe(1);
    expect(active[0]).toBe(bars(el)[2]);
  });

  it('skips the bar of a null value', async () => {
    const data = MONTHS.map((row, i) => (i === 3 ? { ...row, desktop: null } : row));
    const { el, series } = await render(MultipleHost, (h) => h.data.set(data));
    expect(bars(el).length).toBe(11);
    expect(series('desktop').items().map((i) => i.index)).toEqual([0, 1, 2, 4, 5]);
    expect(el.outerHTML).not.toContain('NaN');
  });

  it('renders the frame with empty data and no NaN', async () => {
    const { el } = await render(MultipleHost, (h) => h.data.set([]));
    expect(el.querySelector('svg')).not.toBeNull();
    expect(bars(el).length).toBe(0);
    expect(el.outerHTML).not.toContain('NaN');
  });

  it('labels the chart', async () => {
    const { el } = await render(MultipleHost);
    expect(el.querySelector('svg')?.getAttribute('aria-label')).toBe('Bar chart: Desktop, Mobile');
  });
});

describe('Label list', () => {
  it('puts a formatted label above each bar', async () => {
    const { el, series } = await render(LabelHost);
    const texts = Array.from(el.querySelectorAll('[data-slot="chart-label-list"] text'));
    expect(texts.length).toBe(6);
    expect(texts.map((t) => t.textContent?.trim())).toEqual(MONTHS.map((r) => `${r['desktop']} visits`));
    const items = series('desktop').items();
    expect(Number(texts[0].getAttribute('x'))).toBeCloseTo(items[0].x + items[0].width / 2);
    expect(Number(texts[0].getAttribute('y'))).toBeCloseTo(items[0].y - 12);
    expect(texts[0].getAttribute('text-anchor')).toBe('middle');
    expect(el.querySelector('[data-slot="chart-label-list"]')?.getAttribute('class')).toContain('fill-foreground');
  });

  it('reads its own dataKey and puts the label of a negative bar below it', async () => {
    const { el, series } = await render(NegativeHost);
    const texts = Array.from(el.querySelectorAll('[data-slot="chart-label-list"] text'));
    expect(texts.map((t) => t.textContent?.trim())).toEqual(NEGATIVE.map((r) => r['month']));
    const march = series('visitors').items()[2];
    expect(Number(texts[2].getAttribute('y'))).toBeCloseTo(march.y + march.height + 12);
  });

  it('places insideLeft and right labels on horizontal bars', async () => {
    @Component({
      imports: [IV_CHART_IMPORTS],
      template: `
        <iv-chart [config]="config">
          <svg ivBarChart [data]="data" layout="vertical" [margin]="{ right: 16 }">
            <g ivYAxis dataKey="month" type="category" [hide]="true" />
            <g ivXAxis dataKey="desktop" type="number" [hide]="true" />
            <g ivBar dataKey="desktop" [radius]="4">
              <g ivLabelList dataKey="month" position="insideLeft" [offset]="8" class="fill-(--color-label)" />
              <g ivLabelList dataKey="desktop" position="right" [offset]="8" />
            </g>
          </svg>
        </iv-chart>
      `,
    })
    class CustomHost {
      config = CONFIG;
      data = MONTHS;
    }
    const { el, series } = await render(CustomHost);
    const [inside, right] = Array.from(el.querySelectorAll('[data-slot="chart-label-list"]'));
    const bar = series('desktop').items()[1];
    const a = inside.querySelectorAll('text')[1];
    const b = right.querySelectorAll('text')[1];
    expect(a.textContent?.trim()).toBe('February');
    expect(Number(a.getAttribute('x'))).toBeCloseTo(bar.x + 8);
    expect(a.getAttribute('text-anchor')).toBe('start');
    expect(b.textContent?.trim()).toBe('305');
    expect(Number(b.getAttribute('x'))).toBeCloseTo(bar.x + bar.width + 8);
    expect(Number(b.getAttribute('y'))).toBeCloseTo(bar.y + bar.height / 2);
    expect(inside.getAttribute('class')).toContain('fill-(--color-label)');
    expect(inside.getAttribute('class')).not.toContain('fill-muted-foreground');
  });

  it('labels a line and an area', async () => {
    @Component({
      imports: [IV_CHART_IMPORTS],
      template: `
        <iv-chart [config]="config">
          <svg ivLineChart [data]="data">
            <g ivLine dataKey="desktop"><g ivLabelList /></g>
          </svg>
        </iv-chart>
        <iv-chart [config]="config">
          <svg ivAreaChart [data]="data">
            <g ivArea dataKey="mobile"><g ivLabelList position="inside" /></g>
          </svg>
        </iv-chart>
      `,
    })
    class SeriesHost {
      config = CONFIG;
      data = MONTHS;
    }
    const fixture = TestBed.createComponent(SeriesHost);
    await fixture.whenStable();
    const lists = (fixture.nativeElement as Element).querySelectorAll('[data-slot="chart-label-list"]');
    expect(lists.length).toBe(2);
    expect(Array.from(lists[0].querySelectorAll('text')).map((t) => t.textContent?.trim())).toEqual(
      MONTHS.map((r) => String(r['desktop'])),
    );
    expect(Array.from(lists[1].querySelectorAll('text')).map((t) => t.textContent?.trim())).toEqual(
      MONTHS.map((r) => String(r['mobile'])),
    );
  });
});

describe('Bar chart a11y', () => {
  it('has no axe violations', async () => {
    for (const type of [MultipleHost, VerticalHost, NegativeHost, LabelHost] as const) {
      const fixture = TestBed.createComponent<MultipleHost | VerticalHost | NegativeHost | LabelHost>(type);
      await fixture.whenStable();
      await expect(fixture.nativeElement).toHaveNoViolations();
    }
  });
});
