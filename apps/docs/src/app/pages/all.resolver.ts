import type { Type } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { DEMOS } from '../../generated/demos';

export interface LoadedDemo {
  name: string;
  type: Type<unknown>;
}

/** Loads every demo, sorted by name. */
export const allDemosResolver: ResolveFn<LoadedDemo[]> = () =>
  Promise.all(
    Object.keys(DEMOS)
      .sort()
      .map(async (name) => ({ name, type: await DEMOS[name]() })),
  );
