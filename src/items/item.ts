import type { Bounds, Point } from '~/types'
import { emptyBounds } from '~/utils/bounds'
import bitmap, { type Bitmap } from './bitmap'
import circle, { type Circle } from './circle'
import line, { type Line } from './line'
import rect, { type Rect } from './rect'
import text, { type Text } from './text'
import type { Group } from './group'

export type Item = Rect | Line | Circle | Bitmap | Text | Group
export type ItemData =
  | Omit<Rect, 'id' | 'bounds'>
  | Omit<Line, 'id' | 'bounds'>
  | Omit<Circle, 'id' | 'bounds'>
  | Omit<Bitmap, 'id' | 'bounds'>
  | Omit<Text, 'id' | 'bounds'>

// All this manual dispatching sucks, but since all the item data lives as plain
// objects in the store, a OOP approach won't fit. Dynamically dispatching from
// a map like `itemActions[item.type].translate()` would be better, but I had
// a hard time getting TS to accept this... So a bunch of if/else it is. Should
// work fine since be don't expect much more item behavior.

export const drawItem = (ctx: CanvasRenderingContext2D, item: Item) => {
  if (item.type === 'line') line.draw(ctx, item)
  if (item.type === 'rect') rect.draw(ctx, item)
  if (item.type === 'circle') circle.draw(ctx, item)
  if (item.type === 'bitmap') bitmap.draw(ctx, item)
  if (item.type === 'text') text.draw(ctx, item)
}

export const translateItem = (item: Item, delta: Point) => {
  if (item.type === 'line') line.translate(item, delta)
  if (item.type === 'rect') rect.translate(item, delta)
  if (item.type === 'circle') circle.translate(item, delta)
  if (item.type === 'bitmap') bitmap.translate(item, delta)
  if (item.type === 'text') text.translate(item, delta)
}

export const moveItem = (item: Item, position: Point) => {
  if (item.type === 'line') line.move(item, position)
  if (item.type === 'rect') rect.move(item, position)
  if (item.type === 'circle') circle.move(item, position)
  if (item.type === 'bitmap') bitmap.move(item, position)
  if (item.type === 'text') text.move(item, position)
}

export const getItemBounds = (item: ItemData): Bounds => {
  if (item.type === 'line') return line.getBounds(item)
  if (item.type === 'rect') return rect.getBounds(item)
  if (item.type === 'circle') return circle.getBounds(item)
  if (item.type === 'bitmap') return bitmap.getBounds(item)
  if (item.type === 'text') return text.getBounds(item)
  return emptyBounds
}
