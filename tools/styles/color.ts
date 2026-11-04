// Just enough color math for the contrast test: oklch() to sRGB, alpha compositing, WCAG 2 contrast.

/** sRGB, each channel 0–1. */
export type Rgb = [number, number, number];

type Lab = [number, number, number];

function lab(css: string): Lab {
  const m = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/.exec(css.trim());
  if (!m) throw new Error(`not an oklch() color: ${css}`);
  const h = (Number(m[4]) * Math.PI) / 180;
  return [Number(m[1]) / (m[2] ? 100 : 1), Number(m[3]) * Math.cos(h), Number(m[3]) * Math.sin(h)];
}

function rgb([l, a, b]: Lab): Rgb {
  // OKLab to linear sRGB (Björn Ottosson).
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  return lin.map((c) => Math.min(1, Math.max(0, gamma(c)))) as Rgb;
}

/** `oklch(L C H)` or `oklch(L C H / A)`, gamut-clipped to sRGB. The alpha part is ignored. */
export function oklch(css: string): Rgb {
  return rgb(lab(css));
}

/** `color-mix(in oklab, a p, b)`: `p` (0–1) of `a`, the rest `b`. */
export function mix(a: string, b: string, p: number): Rgb {
  const [x, y] = [lab(a), lab(b)];
  return rgb(x.map((v, i) => v * p + y[i] * (1 - p)) as Lab);
}

/** `top` at `alpha` over an opaque `bottom`, mixed in sRGB like a browser does. */
export function over(top: Rgb, alpha: number, bottom: Rgb): Rgb {
  return top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)) as Rgb;
}

function luminance(rgb: Rgb): number {
  const [r, g, b] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio, 1–21. */
export function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
