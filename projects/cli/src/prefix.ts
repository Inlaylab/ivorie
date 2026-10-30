// Renames the iv prefix in copied code: selectors (iv-tabs, ivButton), classes (IvButton), constants (IV_X).
// Words like IvorieModule, provideIvorie or ivory are not prefix tokens and stay.

export function rewritePrefix(content: string, prefix: string): string {
  if (prefix === 'iv') return content;
  const pascal = prefix[0].toUpperCase() + prefix.slice(1);
  return content
    .replace(/\biv-(?=[a-z])/g, `${prefix}-`)
    .replace(/\biv(?=[A-Z])/g, prefix)
    .replace(/\bIv(?=[A-Z])/g, pascal)
    .replace(/\bIV_/g, `${prefix.toUpperCase()}_`);
}
