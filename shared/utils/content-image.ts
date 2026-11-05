// An image prop on a homepage content component.
//
// Studio 1.7 builds its form from the prop's TypeScript type, and it reads any
// type containing `string | ` as a plain text field - an inline
// `{ src?: string, alt?: string }` included. So it saved a picked photo as a
// bare path, the components read `image.src` from that string, and the image
// silently disappeared. The props are therefore a flat `image` path (Studio's
// media picker) plus an `altText` text, and this reads both shapes, so older
// `{ src, alt }` content - or the object as JSON text - still renders.
// See docs/research/studio-image-swap.md.

export type ContentImage = {
  src: string
  alt: string
}

export const resolveContentImage = (image: unknown, alt?: string): ContentImage | null => {
  if (typeof image === 'string') {
    const value = image.trim()

    if (value.startsWith('{')) {
      try {
        return resolveContentImage(JSON.parse(value), alt)
      } catch {
        return null
      }
    }

    return value ? { src: value, alt: alt ?? '' } : null
  }

  if (image && typeof image === 'object') {
    const { src, alt: ownAlt } = image as { src?: unknown, alt?: unknown }

    if (typeof src === 'string' && src.trim()) {
      return { src: src.trim(), alt: alt || (typeof ownAlt === 'string' ? ownAlt : '') }
    }
  }

  return null
}
