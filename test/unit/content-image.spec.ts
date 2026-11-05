import { describe, expect, it } from 'vitest'
import { resolveContentImage } from '#shared/utils/content-image'

describe('resolveContentImage', () => {
  it('reads the path Studio\'s media picker writes, with the separate alt text', () => {
    expect(resolveContentImage('/images/hero.webp', 'Front room')).toEqual({ src: '/images/hero.webp', alt: 'Front room' })
    expect(resolveContentImage('/images/hero.webp')).toEqual({ src: '/images/hero.webp', alt: '' })
  })

  it('still reads the older { src, alt } object, preferring a set altText', () => {
    expect(resolveContentImage({ src: '/images/a.webp', alt: 'Old alt' })).toEqual({ src: '/images/a.webp', alt: 'Old alt' })
    expect(resolveContentImage({ src: '/images/a.webp', alt: 'Old alt' }, 'New alt')).toEqual({ src: '/images/a.webp', alt: 'New alt' })
  })

  it('reads the object written out as JSON text', () => {
    expect(resolveContentImage('{"src":"/images/a.webp","alt":"Cacao"}')).toEqual({ src: '/images/a.webp', alt: 'Cacao' })
  })

  it('returns nothing for an empty or unusable value, so no broken image is drawn', () => {
    expect(resolveContentImage(undefined)).toBeNull()
    expect(resolveContentImage('')).toBeNull()
    expect(resolveContentImage('   ')).toBeNull()
    expect(resolveContentImage('{not json')).toBeNull()
    expect(resolveContentImage({ alt: 'No src' })).toBeNull()
    expect(resolveContentImage(42)).toBeNull()
  })
})
