// Finds homepage images a visitor would never see. Pure: the caller reads the
// files and says which image paths exist. Used by `check-content-images.ts`.
//
// Homepage pictures are ordinary markdown images (`![alt](/images/...)`), so
// the check walks the same tree MDC builds and looks at every one of them,
// wherever in a block it sits.
import remarkMdc, { parseFrontMatter } from 'remark-mdc'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

export type ImageProblem = {
  /** The block the problem sits in, or `image` for a picture. */
  component: string
  line: number
  message: string
}

type MdcNode = {
  type: string
  name?: string
  url?: string
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
// value that is not JSON text is a leftover - Studio has left `:image: <path>`
// behind before, and its form then shows the field twice - and a YAML object
// under a colon key reaches the component as "[object Object]".
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
    const line = node.position?.start.line ?? 0

    if (node.type === 'image') {
      // Only the site's own files can be checked; a full URL is left alone.
      if (!node.url) {
        problems.push({ component: 'image', line, message: 'image has no path' })
      } else if (node.url.startsWith('/') && !imageExists(node.url)) {
        problems.push({ component: 'image', line, message: `image ${node.url} is not in public/` })
      }
    }

    if (node.type.endsWith('Component') && node.name) {
      const props = propsOf(node)
      const report = (message: string) => problems.push({ component: node.name!, line, message })

      for (const [key, value] of Object.entries(props)) {
        if (key.startsWith(':')) {
          const problem = colonPropProblem(key, value)

          if (problem) report(problem)

          // Both write the same prop, and MDCRenderer keeps whichever comes
          // last in the block - so which one the page shows depends on key
          // order. Studio also shows each as its own field.
          if (key.slice(1) in props) {
            report(`both \`${key.slice(1)}\` and \`${key}\` are set, and the page shows whichever comes last - keep one`)
          }
        }
      }
    }

    node.children?.forEach(visit)
  }

  visit(parser.parse(source) as MdcNode)

  return problems
}
