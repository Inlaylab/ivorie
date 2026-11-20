// Theme choices for the docs, in picker order: Ivorie's own (slate, the site default, leads), then
// shadcn's Classic four, then the legacy four (hidden from pickers unless in use, removed in 2.0).
// Labels, groups, tags and notes come from tools/registry/themes.ts through generated/looks.ts.
import { THEME_INFO, type ThemeInfo } from '../../generated/looks';

export const THEME_LIST: ({ name: string } & ThemeInfo)[] = Object.entries(THEME_INFO).map(([name, info]) => ({ name, ...info }));
/** The font a theme is made for. The playground picks it when you switch to that theme. */
export const THEME_FONTS: Record<string, string> = { mono: 'geist-mono' };
/** The default preview theme: demo frames, the Home wall and the playground start in it. The site itself runs on generated/site-style.css and site-look.css. */
export const DEFAULT_THEME = 'slate';
