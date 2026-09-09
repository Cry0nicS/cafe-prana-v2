import type { SQLOperator } from '@nuxt/content'

// A content file's language is its location, not a field it carries: everything
// under `content/de/` is German and everything else is English. `@nuxt/content`
// strips the default locale's folder when it derives `stem`, so a German stem
// carries exactly one `de/` prefix and an English stem carries none - the same
// shape i18n's `prefix_except_default` gives the URLs. The filter is therefore
// the presence of that prefix, and it reads identically for every collection:
// a page singleton (`de/index`) and a per-item document (`de/events/x`) differ
// only after the prefix. A third locale would slot in as `fr/` untouched.
export const localeStem = (locale: string): ['stem', SQLOperator, string] => {
  return locale === 'de'
    ? ['stem', 'LIKE', 'de/%']
    : ['stem', 'NOT LIKE', 'de/%']
}
