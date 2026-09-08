// Fails when a content file would show "Conflict detected" in Nuxt Studio.
//
// Studio does not compare bytes. It parses the file from GitHub itself, asks
// the deployed site for the same document out of its content database, and
// refuses to open the file if the two do not match. So a build that stores a
// document even slightly differently from how Studio reads the source locks
// the owner out of that page, and nothing about the site or the build going
// green says so - the two conflicts this check was written for shipped as a
// passing build and a healthy site.
//
// Both had the same shape: a difference that lives in the build config or the
// collection schema rather than in the content.
//   - `z.coerce.number().int()` emits JSON-schema `type: "integer"`, which
//     @nuxt/content does not map, so the field landed in a TEXT column and the
//     site held the string "60" where the file held the number 60.
//   - Studio parses MDC with remark-mdc's `autoUnwrap` always on, and the
//     build defaulted it off, so every block component with a single-paragraph
//     slot kept a `["p", ...]` node the site had and Studio did not.
//
// Needs a build first (`npm run build`), because it reads the per-collection
// dumps out of `.output/`. Those are the exact files the deployed site hands
// the browser, which is the point: re-deriving them here would re-derive the
// bug too, whereas the real dump carries whatever the schema, the transformers
// and the modules actually did to each document on the way in.
import { access, readdir, readFile, stat } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { gunzipSync } from 'node:zlib'
import { compressTree } from '@nuxt/content/runtime'
import { stringify } from 'minimark/stringify'
import { parseFrontMatter } from 'remark-mdc'

const ROOT = resolve(import.meta.dirname, '..')
const DUMPS = join(ROOT, '.output', 'public', '__nuxt_content')

// Studio's own comparison helpers, by path because the package does not export
// them. Deliberately not reimplemented: a local copy would keep passing after
// Studio changed how it compares, which is exactly the drift being checked.
const STUDIO_RUNTIME = join(ROOT, 'node_modules', 'nuxt-studio', 'dist', 'module', 'runtime', 'utils')

const studioImport = async (path) => {
  try {
    return await import(new URL(`file://${join(STUDIO_RUNTIME, path)}`))
  } catch {
    console.error(`✖ cannot load nuxt-studio's ${path}.`)
    console.error('  Studio moved its internals; this check has to be pointed at the new path.')
    process.exit(1)
  }
}

const { doObjectsMatch } = await studioImport('object.js')
const { removeLastStylesFromTree } = await studioImport('document/tree.js')

// Studio's runtime imports `@nuxtjs/mdc` from inside `node_modules/nuxt-studio`,
// which npm has given a nested copy of its own whenever its range does not meet
// the one @nuxt/content resolved. The build uses the hoisted copy. Parsing here
// with the one Studio would actually load is what makes a version skew between
// the two show up in CI rather than as a conflict in the editor.
const mdcParsers = [
  join(ROOT, 'node_modules', 'nuxt-studio', 'node_modules', '@nuxtjs', 'mdc', 'dist', 'runtime', 'parser', 'index.js'),
  join(ROOT, 'node_modules', '@nuxtjs', 'mdc', 'dist', 'runtime', 'parser', 'index.js')
]

const parseMarkdown = await (async () => {
  for (const path of mdcParsers) {
    try {
      await access(path)
    } catch {
      continue
    }
    return (await import(new URL(`file://${path}`))).parseMarkdown
  }
  console.error('✖ cannot find @nuxtjs/mdc\'s markdown parser.')
  console.error(`  Looked in:\n${mdcParsers.map(path => `    ${relative(ROOT, path)}`).join('\n')}`)
  process.exit(1)
})()

// The dump is a list of SQL statements, one INSERT per document, with values as
// plain SQL literals ('' escaping a quote inside a string).
function readValues(inner) {
  const values = []
  let index = 0
  while (index < inner.length) {
    while (inner[index] === ' ' || inner[index] === ',') {
      index++
    }
    if (index >= inner.length) {
      break
    }
    if (inner[index] === '\'') {
      let text = ''
      index++
      while (index < inner.length) {
        if (inner[index] === '\'' && inner[index + 1] === '\'') {
          text += '\''
          index += 2
          continue
        }
        if (inner[index] === '\'') {
          index++
          break
        }
        text += inner[index++]
      }
      values.push(text)
      continue
    }
    let literal = ''
    while (index < inner.length && inner[index] !== ',') {
      literal += inner[index++]
    }
    literal = literal.trim()
    values.push(literal === 'NULL' ? null : literal === 'true' ? true : literal === 'false' ? false : Number(literal))
  }
  return values
}

// One document per INSERT, keyed by the column names of its CREATE TABLE.
// `_content_info` holds checksums rather than documents, so it is skipped.
function documentsFromQueries(queries) {
  const documents = []
  let columns = []
  let jsonColumns = new Set()

  for (const line of queries) {
    const create = line.match(/^CREATE TABLE IF NOT EXISTS _content_(\w+) \((.*)\); --/)
    if (create && create[1] !== 'info') {
      columns = ['id', ...[...create[2].matchAll(/"([^"]+)"/g)].map(match => match[1])]
      jsonColumns = new Set([...create[2].matchAll(/"([^"]+)" TEXT/g)].map(match => match[1]))
      continue
    }
    const insert = line.match(/^INSERT INTO _content_(\w+) VALUES \((.*)\); --/)
    if (!insert || insert[1] === 'info') {
      continue
    }
    const values = readValues(insert[2])
    const document = {}
    columns.forEach((column, position) => {
      let value = values[position]
      // A TEXT column holding an object or array is a JSON field; anything
      // else there really is a string and must stay one, or the comparison
      // would paper over the very mismatch it is looking for.
      if (typeof value === 'string' && jsonColumns.has(column) && /^[[{]/.test(value)) {
        try {
          value = JSON.parse(value)
        } catch {
          // not JSON after all; leave it as the string it is
        }
      }
      document[column] = value
    })
    documents.push(document)
  }
  return documents
}

// Mirrors `generateDocumentFromYAMLContent` / `generateDocumentFromMarkdownContent`
// in `nuxt-studio/dist/module/runtime/utils/document/generate.js`, including the
// hardcoded `autoUnwrap: true` that the build has to be configured to match.
const stemFor = id => id.split('/').slice(1).join('/').replace(/\.[^.]+$/, '')

const studioDocument = async (id, source) => {
  if (!id.endsWith('.md')) {
    const { data } = parseFrontMatter(`---\n${source}\n---`)
    return { id, extension: id.split('.').pop(), stem: stemFor(id), meta: {}, ...data }
  }
  const parsed = await parseMarkdown(source, {
    contentHeading: false,
    remark: { plugins: { 'remark-mdc': { options: { autoUnwrap: true } } } }
  })
  return {
    id,
    meta: {},
    extension: 'md',
    stem: stemFor(id),
    body: { ...compressTree(parsed.body), toc: parsed.toc },
    ...parsed.data
  }
}

const bodyOf = body => stringify(removeLastStylesFromTree(body)).replace(/\n/g, '')

// Each collection is one gzipped, base64-encoded JSON array of SQL statements.
let collections
try {
  collections = await readdir(DUMPS)
} catch {
  console.error(`✖ no content dumps under ${relative(ROOT, DUMPS)}.`)
  console.error('  They are written by the build, so run `npm run build` first.')
  process.exit(1)
}

const queries = []
let dumpTime = Number.POSITIVE_INFINITY
for (const collection of collections) {
  const path = join(DUMPS, collection, 'sql_dump.txt')
  const encoded = await readFile(path, 'utf8')
  queries.push(...JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString()))
  dumpTime = Math.min(dumpTime, (await stat(path)).mtimeMs)
}

// A dump older than the content it was built from would compare the files
// against a document nobody is serving, and pass or fail for reasons that have
// nothing to do with Studio. Cheaper to refuse than to report a wrong answer.
const newer = []
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await walk(path)
    } else if ((await stat(path)).mtimeMs > dumpTime) {
      newer.push(relative(ROOT, path))
    }
  }
}
await walk(join(ROOT, 'content'))

if (newer.length > 0) {
  console.error(`✖ ${relative(ROOT, DUMPS)} predates ${newer.length} content file(s), so it is not what a deployment would serve:`)
  for (const path of newer.slice(0, 10)) {
    console.error(`  ${path}`)
  }
  console.error('  Rebuild (`npm run build`) and run this again.')
  process.exit(1)
}

const conflicts = []
let checked = 0

for (const deployed of documentsFromQueries(queries)) {
  // The first segment of a document id is its collection, not a directory.
  const file = join(ROOT, 'content', deployed.id.split('/').slice(1).join('/'))
  let source
  try {
    source = await readFile(file, 'utf8')
  } catch {
    // The dump carries a document whose file is gone, so it was built from a
    // different tree than this one. Same staleness as above, caught later.
    console.error(`✖ ${relative(ROOT, DUMPS)} holds ${relative(ROOT, file)}, which no longer exists.`)
    console.error('  Rebuild (`npm run build`) and run this again.')
    process.exit(1)
  }

  const generated = await studioDocument(deployed.id, source)
  checked += 1

  const { body: generatedBody, ...generatedData } = generated
  const { body: deployedBody, ...deployedData } = deployed

  const bodyMatches = generated.extension !== 'md' || bodyOf(generatedBody) === bodyOf(deployedBody)
  if (bodyMatches && doObjectsMatch(generatedData, deployedData)) {
    continue
  }

  // Studio only ever reports "the content differs", so name the fields.
  const fields = Object.keys(generatedData)
    .filter(key => !doObjectsMatch(generatedData[key], deployedData[key]))
    .map(key => `${key}: file=${JSON.stringify(generatedData[key])} built=${JSON.stringify(deployedData[key])}`)
  if (!bodyMatches) {
    fields.unshift('body: the parsed document tree differs')
  }
  conflicts.push({ file: relative(ROOT, file), fields })
}

if (conflicts.length === 0) {
  console.log(`✔ ${checked} content documents match what Studio derives from their source`)
  process.exit(0)
}

console.error(`✖ ${conflicts.length}/${checked} content documents would show "Conflict detected" in Studio:`)
for (const { file, fields } of conflicts) {
  console.error(`  ${file}`)
  for (const field of fields) {
    console.error(`    ${field}`)
  }
}
process.exitCode = 1
