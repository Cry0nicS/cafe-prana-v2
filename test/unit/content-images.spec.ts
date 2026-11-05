import { describe, expect, it } from 'vitest'
import { findImageProblems } from '~~/scripts/content-images'

const present = new Set(['/images/hero.webp', '/images/menu/cacao.webp'])
const check = (source: string) => findImageProblems(source, src => present.has(src)).map(p => p.message)

const hero = (props: string) => `::home-hero\n---\n${props}\n---\n::\n`

describe('findImageProblems', () => {
  it('passes a path Studio\'s picker writes, quoted or not', () => {
    expect(check(hero('image: /images/hero.webp\naltText: Front room'))).toEqual([])
    expect(check(hero('image: "/images/hero.webp"'))).toEqual([])
    expect(check(':menu-highlight{image="/images/menu/cacao.webp" altText="Cacao" title="Cacao"}\n')).toEqual([])
  })

  it('reports a missing file in every form the component reads', () => {
    expect(check(hero('image: /images/missing.webp'))).toEqual(['image /images/missing.webp is not in public/'])
    expect(check(hero('image: "/images/missing.webp"'))).toEqual(['image /images/missing.webp is not in public/'])
    expect(check(hero('image:\n  src: /images/missing.webp\n  alt: Old'))).toEqual(['image /images/missing.webp is not in public/'])
    expect(check(':menu-highlight{image="/images/missing.webp"}\n')).toEqual(['image /images/missing.webp is not in public/'])
  })

  it('reads a colon prop by its decoded value, so YAML quoting is not mistaken for bad JSON', () => {
    expect(check(hero(':image: \'{"src":"/images/menu/cacao.webp"}\''))).toEqual([])
    expect(check(hero(':image: \'{"src":"/images/missing.webp"}\''))).toEqual(['image /images/missing.webp is not in public/'])
  })

  it('reports the leftover colon prop Studio writes, and a YAML object under a colon key', () => {
    expect(check(hero(':image: /images/hero.webp\nimage: /images/hero.webp'))).toEqual([
      '`:image` holds "/images/hero.webp", which is not JSON - drop the colon or the line',
      'both `image` and `:image` are set, and the page shows whichever comes last - keep one'
    ])
    expect(check(hero(':image:\n  src: /images/hero.webp'))[0]).toContain('holds a YAML object')
  })

  // MDCRenderer keeps whichever of the two comes last, so a missing path on
  // either side can be the one the visitor gets.
  it('reports a plain and a bound image together, and checks both paths, in either order', () => {
    const duplicate = 'both `image` and `:image` are set, and the page shows whichever comes last - keep one'
    const missing = 'image /images/missing.webp is not in public/'

    expect(check(hero('image: /images/hero.webp\n:image: \'"/images/missing.webp"\''))).toEqual([duplicate, missing])
    expect(check(hero(':image: \'"/images/missing.webp"\'\nimage: /images/hero.webp'))).toEqual([duplicate, missing])
  })

  it('reports an image value with no usable path', () => {
    expect(check(hero('image:\n  alt: No src'))).toEqual(['image {"alt":"No src"} has no usable path'])
  })

  it('leaves components without a picture alone', () => {
    expect(check('::feature-grid\n---\ntitle: Philosophy\n---\n::\n')).toEqual([])
  })
})
