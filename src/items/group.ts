import type { Bounds, CodeContext, Point } from '~/types'
import { getTranslatedBounds, makeBounds } from '~/utils/bounds'
import {
  drawItem,
  itemToCode,
  parseItemSettings,
  translateItem,
  type Item,
  type ItemActions,
} from './item'
import { composeRegex, metaRegex } from '~/utils/regex'

export interface Group {
  type: 'group'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  children: Item[]
  readonly bounds: null
}

// TODO: implement
const move = (group: Group) => {}

const translate = (group: Group, delta: Point) => {
  for (const item of group.children) {
    translateItem(item, delta)
    if (item.type !== 'group' && item.type !== 'instance') {
      item.bounds = getTranslatedBounds(item.bounds, delta)
    }
  }
}

const findEdges = (
  item: Item,
  edges: { top: number; left: number; bottom: number; right: number },
) => {
  // TODO handle instance
  if (item.type === 'instance') return

  if (item.type === 'group') {
    for (const child of item.children) findEdges(child, edges)
  } else {
    edges.left = Math.min(edges.left, item.bounds.left)
    edges.right = Math.max(edges.right, item.bounds.right)
    edges.top = Math.min(edges.top, item.bounds.top)
    edges.bottom = Math.max(edges.bottom, item.bounds.bottom)
  }
}

const getBounds = (item: Pick<Group, 'type' | 'children'>) => {
  const edges = {
    top: Infinity,
    left: Infinity,
    bottom: -Infinity,
    right: -Infinity,
  }
  findEdges(item as Item, edges)
  const width = edges.right - edges.left
  const height = edges.bottom - edges.top
  return makeBounds({ x: edges.left, y: edges.top }, { width, height })
}

const draw = (
  ctx: CanvasRenderingContext2D,
  group: Group,
  offset = { x: 0, y: 0 },
) => {
  for (const child of group.children.toReversed()) drawItem(ctx, child, offset)
}

const toCode = (group: Group, ctx: CodeContext) => {
  let code = ''
  const uniqueName = ctx.getUniqueName(group.name)

  if (ctx.comments === 'all') code += `// group-start ${uniqueName}\n`
  code += group.children.map((v) => itemToCode(v, ctx)).join('\n')
  if (ctx.comments === 'all') code += `\n// group-end ${uniqueName}`

  return code
}

const regex = composeRegex(/^\/\/ group-start */, metaRegex)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null

  const { name, settings } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]

  const item = {
    type: 'group' as const,
    name,
    children: [],
    isLocked,
    isHidden,
  }

  return { item, length }
}

export const group: ItemActions<Group> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
