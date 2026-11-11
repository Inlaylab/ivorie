import { InjectionToken, Signal, Type, WritableSignal } from '@angular/core';

/** One series: a label, an optional icon and a color (or a light/dark pair). */
export type IvChartSeries = { label?: string; icon?: Type<unknown> } & (
  | { color?: string; theme?: never }
  | { color?: never; theme: { light: string; dark: string } }
);

/** Series config, keyed by the data key. Each key becomes `--color-<key>`. */
export type IvChartConfig = Record<string, IvChartSeries>;

export type IvChartDatum = Record<string, unknown>;

export interface IvChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface IvChartSize {
  width: number;
  height: number;
}

export interface IvChartActive {
  index: number;
  key?: string;
  x: number;
  y: number;
}

/** One row of the tooltip: a series value under the cursor. */
export interface IvChartPayload {
  key: string;
  name: string;
  value: unknown;
  color: string;
  row: IvChartDatum;
}

export interface IvChartContext {
  /** Value of `data-chart` on the container. */
  id: string;
  config: Signal<IvChartConfig>;
  size: Signal<IvChartSize>;
  active: WritableSignal<IvChartActive | null>;
  /** Rows under the cursor, for the tooltip. */
  payload: WritableSignal<IvChartPayload[]>;
}

export const IV_CHART = new InjectionToken<IvChartContext>('IV_CHART');

/** The CSS color of a series: `var(--color-<key>)`. */
export function ivSeriesColor(key: string): string {
  return `var(--color-${key})`;
}

/** The label of a series, or its key when the config has none. */
export function ivSeriesLabel(config: IvChartConfig, key: string): string {
  return config[key]?.label ?? key;
}

/** One drawn item of a series (a point, a bar or a sector), for labels. */
export interface IvSeriesItem {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: unknown;
  fill: string;
}

/** Provided by each series part: its key and its drawn items. Gap rows have no item. */
export const IV_SERIES = new InjectionToken<{ key: string; items: Signal<IvSeriesItem[]> }>('IV_SERIES');
