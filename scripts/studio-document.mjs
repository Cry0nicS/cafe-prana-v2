// Derives the document Nuxt Studio builds from a content file, and compares it
// against the document the build stored in its dump.
//
// Split out of `check-studio-parity.mjs` so the derivation is unit-testable:
// this module owns the parsing and the comparison, the script owns git, the
// filesystem and the reporting. Whenever Studio changes how it reads a file,
// this is the file that has to follow it.
import { access } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { compressTree } from '@nuxt/content/runtime'
import { stringify } from 'minimark/stringify'
import { parseFrontMatter } from 'remark-mdc'

const ROOT = resolve(import.meta.dirname, '..')

// Studio's own comparison helpers, by path because the package does not export
// them. Deliberately not reimplemented: a local copy would keep passing after
// Studio changed how it compares, which is exactly the drift being checked.
const STUDIO_RUNTIME = join(ROOT, 'node_modules', 'nuxt-studio', 'dist', 'module', 'runtime', 'utils')

const studioImport = async (path) => {
  try {
    return await import(new URL(`file://${join(STUDIO_RUNTIME, path)}`))
  } catch (error) {
    throw new Error(
      `cannot load nuxt-studio's ${path} - Studio moved its internals, so this check has to be `
      + 'pointed at the new path',
      { cause: error }
    )
  }
}

const { doObjectsMatch } = await studioImport('object.js')
const { removeLastStylesFromTree } = await studioImport('document/tree.js')
const { generateFsPathFromId } = await studioImport('collection.js')
const { getCollectionSourceById } = await studioImport('source.js')

// Studio's runtime imports `@nuxtjs/mdc` from inside `node_modules/nuxt-studio`,
// which npm has given a nested copy of its own whenever its range does not meet
// the one @nuxt/content resolved. The build uses the hoisted copy. Parsing here
// with the one Studio would actually load is what makes a version skew between
// the two show up in CI rather than as a conflict in the editor.
const MDC_PARSERS = [
  join(ROOT, 'node_modules', 'nuxt-studio', 'node_modules', '@nuxtjs', 'mdc', 'dist', 'runtime', 'parser', 'index.js'),
  join(ROOT, 'node_modules', '@nuxtjs', 'mdc', 'dist', 'runtime', 'parser', 'index.js')
]

const parseMarkdown = await (async () => {
  for (const path of MDC_PARSERS) {
    try {
      await access(path)
    } catch {
      continue
    }
    return (await import(new URL(`file://${path}`))).parseMarkdown
  }
  throw new Error(`cannot find @nuxtjs/mdc's markdown parser in any of: ${MDC_PARSERS.join(', ')}`)
})()

// Studio hands its parser this plugin alongside remark-mdc. It is not the
// `remark-emoji` package @nuxt/content registers, and the two do not agree:
// see `findEmojiShortcodes` below.
const { remarkEmojiPlugin } = await import('nuxt-studio/app/utils')

// The remark plugins Studio parses with, in `generateDocumentFromMarkdownContent`.
const STUDIO_REMARK_PLUGINS = {
  'emoji': { instance: remarkEmojiPlugin },
  'remark-mdc': { options: { autoUnwrap: true } }
}

// An emoji shortcode is the one input known to parse differently on the two
// sides: @nuxt/content's `remark-emoji` turns `:tada:` into the character,
// while Studio's plugin turns it into a span carrying an aria-label. Anything
// containing one therefore cannot match, whatever else is correct about it.
//
// Anchored so a time never matches: a shortcode starts with a letter and is not
// preceded by a digit or another colon, which rules out `09:30-11:30`, `18:00`,
// `https://` and MDC's own `::block` / `:inline{...}` syntax.
const EMOJI_SHORTCODE = /(?<![\da-z:]):([a-z][a-z0-9_+-]{1,29}):(?!\d)/g

export const EMOJI_SHORTCODE_HINT
  = 'emoji shortcodes parse differently in the build and in Studio, so a document holding one can '
    + 'never match: paste the emoji character itself instead'

export const findEmojiShortcodes = source =>
  [...String(source).matchAll(EMOJI_SHORTCODE)].map(match => match[0])

const stemFor = id => id.split('/').slice(1).join('/').replace(/\.[^.]+$/, '')

// Mirrors `generateDocumentFromYAMLContent` / `generateDocumentFromMarkdownContent`
// in `nuxt-studio/dist/module/runtime/utils/document/generate.js`, including the
// hardcoded `autoUnwrap: true` that the build has to be configured to match.
export const studioDocument = async (id, source) => {
  if (!id.endsWith('.md')) {
    const { data } = parseFrontMatter(`---\n${source}\n---`)
    return { id, extension: id.split('.').pop(), stem: stemFor(id), meta: {}, ...data }
  }
  const parsed = await parseMarkdown(source, {
    contentHeading: false,
    remark: { plugins: STUDIO_REMARK_PLUGINS }
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

export const documentBodyString = body =>
  stringify(removeLastStylesFromTree(body)).replace(/\n/g, '')

// `matches` is the verdict; `fields` names the frontmatter keys that differ, so
// a failure says which field rather than only that the document does not match.
export const compareDocuments = (generated, deployed) => {
  const { body: generatedBody, ...generatedData } = generated
  const { body: deployedBody, ...deployedData } = deployed

  const bodyMatches = generated.extension !== 'md'
    || documentBodyString(generatedBody) === documentBodyString(deployedBody)

  const fields = Object.keys(generatedData)
    .filter(key => !doObjectsMatch(generatedData[key], deployedData[key]))

  return { matches: bodyMatches && fields.length === 0, bodyMatches, fields }
}

// --- reading the build's dump ------------------------------------------------

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
export function documentsFromQueries(queries) {
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

// A document id back to the file it came from: `eventsEn/events/spring.md` ->
// `content/en/events/spring.md`.
//
// Not derivable by stripping the collection segment any more. Under the
// locale-folder layout a collection's `include` carries the locale and its
// `prefix` carries the public URL, so the id holds the prefix rather than the
// folder - `eventsEn/events/spring.md` for a file that lives in `en/events/`.
// Studio does this reconstruction itself to decide which file a row belongs to,
// and it is the mapping this whole check exists to mirror, so use Studio's
// implementation rather than a second guess at it.
//
// `collections` is passed in rather than imported here: it comes from the build
// (`.nuxt/content/preview.mjs`, the same source Studio's runtime reads it
// from), and `nuxt prepare` alone does not write that file. Loading it at
// module scope would make merely importing this module require a full build,
// which is what keeps the derivation unit-testable - see the header. The caller
// needs a build anyway for the dumps to exist.
export const loadBuiltCollections = async () => {
  const path = join(ROOT, '.nuxt', 'content', 'preview.mjs')

  try {
    return (await import(new URL(`file://${path}`))).collections
  } catch (error) {
    throw new Error(
      'cannot load .nuxt/content/preview.mjs - it is written by `npm run build`, not by `nuxt prepare`',
      { cause: error }
    )
  }
}

export const contentPathFor = (id, collections) => {
  const collectionName = id.split(/[/:]/)[0]
  const collection = collections[collectionName]

  if (!collection) {
    throw new Error(`document id '${id}' names collection '${collectionName}', which is not in the build`)
  }

  return `content/${generateFsPathFromId(id, getCollectionSourceById(id, collection.source))}`
}
