import { cloneVNode, type FunctionalComponent, type VNode } from 'vue'

// A homepage section's text is plain markdown in its slot, so the owner edits
// it inline in Studio. The section still has to know which line is its title
// and which picture is its photo, and that is what this sorts out.
//
// MDCRenderer stamps the markdown tag on what it renders (`component.tag`,
// the same field its own `unwrapSlot` reads), so a node can be told apart
// without looking at the DOM.
const tagOf = (node: VNode) =>
  typeof node.type === 'string' ? node.type : (node.type as { tag?: string } | null)?.tag

const childrenOf = (node: VNode): VNode[] => {
  const children = node.children as VNode[] | { default?: () => VNode[] } | null

  return Array.isArray(children) ? children : children?.default?.() ?? []
}

// The pictures of a paragraph that holds nothing else, which is how markdown
// wraps `![alt](src)` on a line of its own. A paragraph with words in it is
// text, even when a picture sits in the middle of it.
const picturesOf = (node: VNode): VNode[] | null => {
  if (tagOf(node) === 'img') return [node]
  if (tagOf(node) !== 'p') return null

  const children = childrenOf(node).filter(child => typeof child.children !== 'string' || child.children.trim())

  return children.length && children.every(child => tagOf(child) === 'img') ? children : null
}

export type SlotParts = {
  /** What is written above the title: the hero's line of news. */
  kicker: VNode[]
  /** The first `#` or `##`, or the `###` of a block that has neither. */
  title: VNode[]
  /** What follows the title, up to the first `###` under it. */
  body: VNode[]
  /** Each `###` under the title, with what is written beneath it. */
  items: { title: VNode[], body: VNode[] }[]
  /** Every picture that stands on its own line. */
  media: VNode[]
  /** The nested blocks named by `block` (`feature`, `menu-highlight`). */
  blocks: VNode[]
}

export const splitSlot = (nodes: VNode[] = [], block?: string): SlotParts => {
  const parts: SlotParts = { kicker: [], title: [], body: [], items: [], media: [], blocks: [] }
  const copy: VNode[] = []

  for (const node of nodes) {
    const pictures = picturesOf(node)

    if (pictures) parts.media.push(...pictures)
    else if (block && tagOf(node) === block) parts.blocks.push(node)
    else copy.push(node)
  }

  let titleAt = copy.findIndex(node => ['h1', 'h2'].includes(tagOf(node) ?? ''))
  if (titleAt === -1) titleAt = copy.findIndex(node => tagOf(node) === 'h3')

  copy.forEach((node, index) => {
    if (index < titleAt) parts.kicker.push(node)
    else if (index === titleAt) parts.title.push(node)
    else if (tagOf(node) === 'h3') parts.items.push({ title: [node], body: [] })
    else (parts.items.at(-1)?.body ?? parts.body).push(node)
  })

  return parts
}

// Both are called during the parent's render, never cached: Studio's live
// preview swaps the slot content, and a computed would keep the old nodes.
export const SlotParts: FunctionalComponent<
  { nodes?: VNode[], block?: string },
  Record<string, never>,
  { default: (parts: SlotParts) => VNode[] }
> = (props, { slots }) => slots.default?.(splitSlot(props.nodes, props.block))

SlotParts.props = ['nodes', 'block']

// Every node placed here is marked `home-md`, which makes a markdown heading or
// paragraph typographically transparent (see `main.css`): the section sets the
// type on the wrapper, with ordinary utilities. `extra` is merged in instead
// for pictures: how a section hands one its frame and its `sizes` without the
// owner writing either.
export const Nodes: FunctionalComponent<{ nodes: VNode[], extra?: Record<string, unknown> }> = props =>
  props.nodes.map(node => cloneVNode(node, props.extra ?? { class: 'home-md' }))

Nodes.props = ['nodes', 'extra']
