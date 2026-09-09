import { collections } from './node_modules/.cache/nuxt/.nuxt/content/preview.mjs'
import { getCollectionSourceById } from './node_modules/nuxt-studio/dist/module/runtime/utils/source.js'
import { generateFsPathFromId } from './node_modules/nuxt-studio/dist/module/runtime/utils/collection.js'
import { minimatch } from 'minimatch'

const id = 'index/de/index.md'
const sources = collections.index.source
const matched = getCollectionSourceById(id, sources)
console.log('matched source:', JSON.stringify(matched))
console.log('fsPath:', generateFsPathFromId(id, matched))
console.log('per-source, from the de source explicitly:', generateFsPathFromId(id, sources[1]))
console.log("minimatch('en/de/index.md','en/*.md') =", minimatch('en/de/index.md', 'en/*.md', { dot: true }))
console.log("minimatch('de/index.md','de/*.md') =", minimatch('de/index.md', 'de/*.md', { dot: true }))
