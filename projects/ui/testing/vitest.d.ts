import 'vitest';

declare module 'vitest' {
  interface Matchers<T = any> {
    /** Runs axe-core on the element. Await it. */
    toHaveNoViolations(): Promise<T>;
  }
}
