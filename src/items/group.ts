import type { Bounds, Point } from '~/types'
import { getTranslatedBounds, makeBounds } from '~/utils/bounds'
import { translateItem, type Item } from './item'

export interface Group {
  type: 'group'
  id: number
  name: string
  isHidden: boolean
  isLocked: boolean
  children: Item[]
  bounds: null
}

// TODO: implement
const move = (group: Group) => {}

const translate = (group: Group, delta: Point) => {
  for (const item of group.children) {
    translateItem(item, delta)
    if (item.type !== 'group') {
      item.bounds = getTranslatedBounds(item.bounds, delta)
    }
  }
}

const findEdges = (
  item: Item,
  edges: { top: number; left: number; bottom: number; right: number },
) => {
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

export default { translate, move, getBounds }
