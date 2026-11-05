// Finds homepage images a visitor would never see. Pure: the caller reads the
// files and says which image paths exist. Used by `check-content-images.ts`.
//
// Props are read the way MDC reads them, not line by line: a block's YAML is
// decoded with remark-mdc's own front-matter parser, and an inline
// component's attributes come from its parse tree. So YAML quoting and the
// older `{ src, alt }` object are handled like the site handles them.
// See docs/research/studio-image-swap.md.
import remarkMdc, { parseFrontMatter } from 'remark-mdc'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { resolveContentImage } from '../shared/utils/content-image'

// The components whose `image` prop is drawn as a picture.
export const IMAGE_COMPONENTS = ['home-hero', 'events-intro', 'menu-highlight', 'story-section']

export type ImageProblem = {
  component: string
  line: number
  message: string
}

type MdcNode = {
  type: string
  name?: string
  attributes?: Record<string, unknown>
  rawData?: string
  position?: { start: { line: number } }
  children?: MdcNode[]
}

const parser = unified().use(remarkParse).use(remarkMdc)

// A block's YAML props (`rawData`) merged with its inline `{...}` attributes.
const propsOf = (node: MdcNode): Record<string, unknown> => {
  const yaml = node.rawData ? parseFrontMatter(`---${node.rawData}`).data : {}

  return { ...(node.attributes ?? {}), ...yaml }
}

// A `:key` prop is MDC's marker for a JSON value, evaluated at render time. A
// value that is not JSON text is a leftover - Studio leaves `:image: <path>`
// behind, and its form then shows the field twice - and a YAML object under a
// colon key reaches the component as "[object Object]".
const colonPropProblem = (key: string, value: unknown): string | null => {
  if (typeof value !== 'string') {
    return `\`${key}\` holds a YAML ${Array.isArray(value) ? 'list' : typeof value}, which MDC cannot read - drop the colon`
  }

  try {
    JSON.parse(value)
    return null
  } catch {
    return `\`${key}\` holds "${value}", which is not JSON - drop the colon or the line`
  }
}

export const findImageProblems = (source: string, imageExists: (src: string) => boolean): ImageProblem[] => {
  const problems: ImageProblem[] = []

  const visit = (node: MdcNode) => {
    if (node.type.endsWith('Component') && node.name) {
      const props = propsOf(node)
      const line = node.position?.start.line ?? 0
      const report = (message: string) => problems.push({ component: node.name!, line, message })

      for (const [key, value] of Object.entries(props)) {
        if (key.startsWith(':')) {
          const problem = colonPropProblem(key, value)

          if (problem) report(problem)
        }
      }

      if (IMAGE_COMPONENTS.includes(node.name)) {
        // What the renderer hands the component: `image`, else `:image` as JSON.
        let raw = props.image

        if (raw === undefined && typeof props[':image'] === 'string') {
          try {
            raw = JSON.parse(props[':image'])
          } catch {
            // already reported above
          }
        }

        const image = resolveContentImage(raw)

        if (raw !== undefined && !image) {
          report(`image ${JSON.stringify(raw)} has no usable path`)
        } else if (image && !imageExists(image.src)) {
          report(`image ${image.src} is not in public/`)
        }
      }
    }

    node.children?.forEach(visit)
  }

  visit(parser.parse(source) as MdcNode)

  return problems
}
