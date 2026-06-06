// Defence-in-depth sanitiser for model-generated SVG before it's injected via
// dangerouslySetInnerHTML. The SVG comes from our own model, but we still strip
// anything executable so a malformed or poisoned diagram can't run script.
export function sanitizeSvg(svg: unknown): string {
  if (typeof svg !== 'string') return ''
  const trimmed = svg.trim()
  // Only render genuine SVG markup — never arbitrary HTML.
  if (!/^<svg[\s>]/i.test(trimmed)) return ''

  return trimmed
    // Drop dangerous elements entirely (open + close + contents where relevant).
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?(script|foreignObject|iframe|object|embed|link|meta|style|animate|set|handler)\b[^>]*>/gi, '')
    // Strip inline event handlers: on*="..." / on*='...' / on*=value
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // Strip javascript: in href / xlink:href.
    .replace(/(href|xlink:href)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|xlink:href)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'")
    .trim()
}
