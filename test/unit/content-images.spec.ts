import { describe, expect, it } from 'vitest'
import { findImageProblems } from '~~/scripts/content-images'

const present = new Set(['/images/hero.webp', '/images/menu/cacao.webp'])
const check = (source: string) => findImageProblems(source, src => present.has(src)).map(p => p.message)

const hero = (body: string) => `::home-hero\n# Welcome\n\n${body}\n::\n`

describe('findImageProblems', () => {
  it('passes a picture whose file is there, at the top of a block or nested in one', () => {
    expect(check(hero('![Front room](/images/hero.webp)'))).toEqual([])
    expect(check('::menu-highlights\n## Favourites\n\n  :::menu-highlight\n  ![Cacao](/images/menu/cacao.webp)\n\n  ### Cacao\n  :::\n::\n')).toEqual([])
  })

  it('reports a missing file, with the line it is on', () => {
    expect(findImageProblems(hero('![Front room](/images/missing.webp)'), () => false)).toEqual([
      { component: 'image', line: 4, message: 'image /images/missing.webp is not in public/' }
    ])
  })

  it('reports every missing picture of a gallery', () => {
    expect(check('::gallery\n![One](/images/hero.webp)\n\n![Two](/images/gone.webp)\n\n![Three](/images/lost.webp)\n::\n')).toEqual([
      'image /images/gone.webp is not in public/',
      'image /images/lost.webp is not in public/'
    ])
  })

  it('reports a picture with no path', () => {
    expect(check(hero('![Front room]()'))).toEqual(['image has no path'])
  })

  it('leaves a picture hosted elsewhere alone', () => {
    expect(check(hero('![Elsewhere](https://example.com/photo.jpg)'))).toEqual([])
  })

  it('reports the leftover colon prop Studio writes, and a YAML object under a colon key', () => {
    const block = (props: string) => `::feature\n---\n${props}\n---\n::\n`

    expect(check(block(':icon: i-lucide-leaf\nicon: i-lucide-leaf'))).toEqual([
      '`:icon` holds "i-lucide-leaf", which is not JSON - drop the colon or the line',
      'both `icon` and `:icon` are set, and the page shows whichever comes last - keep one'
    ])
    expect(check(block(':icon:\n  name: i-lucide-leaf'))[0]).toContain('holds a YAML object')
  })

  it('leaves a block without a picture alone', () => {
    expect(check('::feature-grid\n## Philosophy\n::\n')).toEqual([])
  })
})
