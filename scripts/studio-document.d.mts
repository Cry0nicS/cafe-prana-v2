// Types for `studio-document.mjs`. The scripts are plain JS because they run
// under `node` with no build step, so the declarations live beside the module
// and give the unit tests a real API to import.

export type StudioDocument = {
  id: string
  extension?: string
  stem?: string
  meta?: Record<string, unknown>
  body?: unknown
} & Record<string, unknown>

export type DeployedDocument = { id: string } & Record<string, unknown>

export type DocumentComparison = {
  /** The verdict: false means Studio would report "Conflict detected". */
  matches: boolean
  bodyMatches: boolean
  /** Frontmatter keys whose values differ, so a failure can name them. */
  fields: string[]
}

export const EMOJI_SHORTCODE_HINT: string

export function findEmojiShortcodes(source: string): string[]
export function studioDocument(id: string, source: string): Promise<StudioDocument>
export function documentBodyString(body: unknown): string
export function compareDocuments(generated: StudioDocument, deployed: DeployedDocument): DocumentComparison
export function documentsFromQueries(queries: string[]): DeployedDocument[]
export function contentPathFor(id: string): string
