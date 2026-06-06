import { describe, it, expect } from 'vitest'
import { sanitizeSvg } from './sanitize-svg'

describe('sanitizeSvg', () => {
  it('keeps a normal SVG intact', () => {
    const svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" stroke="#111827"/></svg>'
    expect(sanitizeSvg(svg)).toContain('<circle')
  })

  it('rejects non-SVG input', () => {
    expect(sanitizeSvg('<div>hello</div>')).toBe('')
    expect(sanitizeSvg('not markup')).toBe('')
    expect(sanitizeSvg(null)).toBe('')
  })

  it('strips <script> elements', () => {
    const out = sanitizeSvg('<svg><script>alert(1)</script><rect/></svg>')
    expect(out).not.toMatch(/script/i)
    expect(out).toContain('<rect')
  })

  it('strips inline event handlers', () => {
    const out = sanitizeSvg('<svg><rect onload="alert(1)" onclick=\'x()\' /></svg>')
    expect(out).not.toMatch(/onload/i)
    expect(out).not.toMatch(/onclick/i)
  })

  it('neutralises javascript: hrefs', () => {
    const out = sanitizeSvg('<svg><a href="javascript:alert(1)"><rect/></a></svg>')
    expect(out).not.toMatch(/javascript:/i)
  })

  it('removes foreignObject', () => {
    const out = sanitizeSvg('<svg><foreignObject><body>x</body></foreignObject></svg>')
    expect(out).not.toMatch(/foreignObject/i)
  })
})
