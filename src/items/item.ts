import type { Bounds, Point } from '~/types'
import { emptyBounds } from '~/utils/bounds'
import bitmap, { type Bitmap } from './bitmap'
import circle, { type Circle } from './circle'
import type { Group } from './group'
import group from './group'
import line, { type Line } from './line'
import rect, { type Rect } from './rect'
import text, { type Text } from './text'

export type Item = Rect | Line | Circle | Bitmap | Text | Group
export type ItemData =
  | Omit<Rect, 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'>
  | Omit<Line, 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'>
  | Omit<Circle, 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'>
  | Omit<Bitmap, 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'>
  | Omit<Text, 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'>
  | Omit<Group, 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'>

export type ItemType = 'line' | 'rect' | 'circle' | 'bitmap' | 'text' | 'group'

export type ItemByType<T extends ItemType> = T extends 'line'
  ? Line
  : T extends 'rect'
    ? Rect
    : T extends 'circle'
      ? Circle
      : T extends 'bitmap'
        ? Bitmap
        : T extends 'text'
          ? Text
          : T extends 'group'
            ? Group
            : never

// All this manual dispatching sucks, but since all the item data lives as plain
// objects in the store, a OOP approach won't fit. Dynamically dispatching from
// a map like `itemActions[item.type].translate()` would be better, but I had
// a hard time getting TS to accept this... So a bunch of if/else it is. Should
// work fine since be don't expect much more item behavior.

export const drawItem = (ctx: CanvasRenderingContext2D, item: Item) => {
  if (item.isHidden) return

  if (item.type === 'line') line.draw(ctx, item)
  if (item.type === 'rect') rect.draw(ctx, item)
  if (item.type === 'circle') circle.draw(ctx, item)
  if (item.type === 'bitmap') bitmap.draw(ctx, item)
  if (item.type === 'text') text.draw(ctx, item)
  if (item.type === 'group') {
    for (const child of item.children.toReversed()) drawItem(ctx, child)
  }
}

export const translateItem = (item: Item, delta: Point) => {
  if (item.type === 'line') line.translate(item, delta)
  if (item.type === 'rect') rect.translate(item, delta)
  if (item.type === 'circle') circle.translate(item, delta)
  if (item.type === 'bitmap') bitmap.translate(item, delta)
  if (item.type === 'text') text.translate(item, delta)
  if (item.type === 'group') group.translate(item, delta)
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
  if (item.type === 'group') return group.getBounds(item)
  return emptyBounds
}
