import type { Item, ItemData } from '~/stores/frames'
import type { Bounds, Point } from '~/types'
import { getLineBounds, moveLine, translateLine } from './line'
import { getRectBounds, moveRect, translateRect } from './rect'
import { getCircleBounds, moveCircle, translateCircle } from './circle'
import { getBitmapBounds, moveBitmap, translateBitmap } from './bitmap'
import { getTextBounds } from './text'
import { emptyBounds } from '~/utils/bounds'

export const translateItem = (item: Item, delta: Point) => {
  if (item.type === 'line') translateLine(item, delta)
  if (item.type === 'rect') translateRect(item, delta)
  if (item.type === 'circle') translateCircle(item, delta)
  if (item.type === 'bitmap') translateBitmap(item, delta)
}

export const moveItem = (item: Item, position: Point) => {
  if (item.type === 'line') moveLine(item, position)
  if (item.type === 'rect') moveRect(item, position)
  if (item.type === 'circle') moveCircle(item, position)
  if (item.type === 'bitmap') moveBitmap(item, position)
}

export const getItemBounds = (item: ItemData): Bounds => {
  if (item.type === 'line') return getLineBounds(item)
  if (item.type === 'rect') return getRectBounds(item)
  if (item.type === 'circle') return getCircleBounds(item)
  if (item.type === 'bitmap') return getBitmapBounds(item)
  if (item.type === 'text') return getTextBounds(item)
  return emptyBounds
}
