import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import { CAFE_LEGAL_NAME, CAFE_SITE_URL } from '#shared/utils/constants'

type CafeSeoOptions = {
  title: MaybeRefOrGetter<string | undefined>
  description: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article'>
  noindex?: MaybeRefOrGetter<boolean | undefined>
}

const toAbsoluteUrl = (value?: string) => {
  if (!value) {
    return undefined
  }

  if (/^https?:\/\//.test(value)) {
    return value
  }

  return `${CAFE_SITE_URL}${value.startsWith('/') ? value : `/${value}`}`
}

const withoutTrailingSlash = (path: string) => {
  if (path === '/') {
    return path
  }

  return path.replace(/\/$/, '')
}

const getUnprefixedPath = (path: string) => {
  const normalizedPath = withoutTrailingSlash(path)
  const unprefixedPath = normalizedPath.replace(/^\/de(?=\/|$)/, '')

  return unprefixedPath || '/'
}

const formatTitle = (title?: string) => {
  if (!title) {
    return CAFE_LEGAL_NAME
  }

  if (/caf[eé]\s+prana/i.test(title)) {
    return title
  }

  return `${title} | ${CAFE_LEGAL_NAME}`
}

export const useCafeSeo = (options: CafeSeoOptions) => {
  const route = useRoute()

  const title = computed(() => formatTitle(toValue(options.title)))
  const description = computed(() => toValue(options.description))
  const image = computed(() => toAbsoluteUrl(toValue(options.image) || '/images/hero.webp'))
  const type = computed(() => toValue(options.type) || 'website')
  const noindex = computed(() => Boolean(toValue(options.noindex)))

  const englishPath = computed(() => getUnprefixedPath(route.path))
  const germanPath = computed(() => englishPath.value === '/' ? '/de' : `/de${englishPath.value}`)
  const canonicalPath = computed(() => withoutTrailingSlash(route.path) || '/')
  const canonicalUrl = computed(() => toAbsoluteUrl(canonicalPath.value))

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage: image,
    ogUrl: canonicalUrl,
    ogType: type,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: () => noindex.value ? 'noindex, follow' : 'index, follow'
  })

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
      { rel: 'alternate', hreflang: 'en-US', href: toAbsoluteUrl(englishPath.value) },
      { rel: 'alternate', hreflang: 'de-DE', href: toAbsoluteUrl(germanPath.value) },
      { rel: 'alternate', hreflang: 'x-default', href: toAbsoluteUrl(englishPath.value) }
    ]
  }))

  return {
    canonicalUrl,
    toAbsoluteUrl
  }
}
