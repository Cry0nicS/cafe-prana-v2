// Do the tighter single-file globs behave in both glob engines?
// @nuxt/content globs with tinyglobby; Studio matches ids back with minimatch.
import { glob } from 'tinyglobby'
import { minimatch } from 'minimatch'

const parseSourceBase = include => (include.includes('*') ? include.split('*')[0] : '') || ''

for (const include of ['en/*.md', 'en/**/index.md', 'en/*.yml', 'en/**/menu.yml', 'de/**/index.md']) {
  const keys = await glob(include, { cwd: 'content', dot: true, expandDirectories: false })
  const fixed = parseSourceBase(include)
  console.log(`${include.padEnd(20)} fixed=${JSON.stringify(fixed).padEnd(8)} keys=${JSON.stringify(keys.map(k => k.substring(fixed.length)))}`)
  for (const k of keys) console.log(`   minimatch(${k}, ${include}) = ${minimatch(k, include, { dot: true })}`)
}
