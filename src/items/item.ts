import type { Bounds, Point } from '~/types'
import { bitmap, type Bitmap } from './bitmap'
import { circle, type Circle } from './circle'
import { group, type Group } from './group'
import { line, type Line } from './line'
import { rect, type Rect } from './rect'
import { text, type Text } from './text'

const items = { bitmap, circle, group, line, rect, text }

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

export type ItemActions<T = any> = {
  draw: (ctx: CanvasRenderingContext2D, item: T) => void
  translate: (item: T, delta: Point) => void
  move: (item: T, position: Point) => void
  getBounds: (item: T) => Bounds
  toCode: (item: T) => string
}

// Unfortunately dispatching the item methods based on their `type` property
// doesn't work with typescript, so `any` it is ...
// Keeping the item logic separated and not using OOP/polymorphism is still a
// worth it since we can keep all the state in pinia and implement features
// like history, copy & paste, ... without having to create any class instances.

export const drawItem = (ctx: CanvasRenderingContext2D, item: Item) => {
  if (item.isHidden) return
  items[item.type].draw(ctx, item as any)
}

export const translateItem = (item: Item, delta: Point) =>
  items[item.type].translate(item as any, delta)

export const moveItem = (item: Item, position: Point) =>
  items[item.type].move(item as any, position)

export const getItemBounds = (item: ItemData): Bounds =>
  items[item.type].getBounds(item as any)

export const itemToCode = (item: Item): string =>
  items[item.type].toCode(item as any)
