import type { Type } from '@angular/core';

export type DocSection = 'guide' | 'component';
export type DocSegment =
  | { kind: 'html'; html: string }
  | { kind: 'demo'; name: string }
  | { kind: 'install'; slug: string; entry: string };
export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}
export interface DocDemoSource {
  /** Shiki HTML. */
  code: string;
  /** File source, for the copy button. */
  raw: string;
}
export interface DocPage {
  slug: string;
  title: string;
  description: string;
  section: DocSection;
  /** '@inlaylab/ivorie/tabs' for components, null for guides. */
  entry: string | null;
  segments: DocSegment[];
  toc: TocItem[];
  /** Only the demos used on this page. */
  demos: Record<string, DocDemoSource>;
}
export interface PageEntry {
  slug: string;
  title: string;
  description: string;
  section: DocSection;
  order: number;
  load: () => Promise<DocPage>;
}
export type DemoLoader = () => Promise<Type<unknown>>;
