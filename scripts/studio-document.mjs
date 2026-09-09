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

// A document id back to the file it came from:
//
//   openingHours/opening-hours.yml  -> content/opening-hours.yml
//   indexEn/index.md                -> content/en/index.md
//   indexDe/de/index.md             -> content/de/index.md
//   eventsEn/events/spring.md       -> content/en/events/spring.md
//   eventsDe/de/events/spring.md    -> content/de/events/spring.md
//
// The first segment of an id is its collection, not a directory. What follows
// is the collection's URL `prefix` plus the file's tail - so a German id
// already carries `de/` (that is its prefix), while an English one carries
// nothing, because `en` is i18n's unprefixed default locale. The locale folder
// therefore has to be put back for English, and only for English.
//
// Derived from this repo's own collection naming (`...En` / `...De`, one
// collection per locale - see docs/adr/0001-bilingual-content-layout.md) rather
// than from Studio's `generateFsPathFromId`. That is the deliberate exception
// to this file's rule about not reimplementing Studio: this mapping follows
// from *our* content config, not from Studio's internals, and Studio's version
// needs the resolved collection sources, which are not available after a build
// (`.nuxt/content/preview.mjs` is written by the dev server, not by `nuxt
// build`).
const LOCALE_BY_COLLECTION_SUFFIX = { En: 'en', De: 'de' }

export const contentPathFor = (id) => {
  const [collection, ...rest] = id.split(/[/:]/)
  const tail = rest.join('/')

  const suffix = Object.keys(LOCALE_BY_COLLECTION_SUFFIX).find(candidate => collection.endsWith(candidate))
  const locale = suffix ? LOCALE_BY_COLLECTION_SUFFIX[suffix] : null

  if (locale && !tail.startsWith(`${locale}/`)) {
    return `content/${locale}/${tail}`
  }

  return `content/${tail}`
}
