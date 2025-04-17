import type { Bounds, CodeContext, Point } from '~/types'
import { bitmap, type Bitmap } from './bitmap'
import { circle, type Circle } from './circle'
import { group, type Group } from './group'
import { line, type Line } from './line'
import { rect, type Rect } from './rect'
import { text, type Text } from './text'
import { instance, type Instance } from './instance'
import { polygon, type Polygon } from './polygon'

const items = { bitmap, circle, group, line, rect, polygon, text, instance }

export const itemTypes = [
  'line',
  'rect',
  'polygon',
  'circle',
  'bitmap',
  'text',
  'instance',
  'group',
] as const

export type Item =
  | Rect
  | Line
  | Circle
  | Polygon
  | Bitmap
  | Text
  | Instance
  | Group

export type ItemType = Item['type']

type ItemTypeMap = {
  [K in ItemType]: Extract<Item, { type: K }>
}

export type ItemByType<T extends ItemType> = T extends ItemType
  ? ItemTypeMap[T]
  : never

export type ParsedItem<T = Item> = Omit<T, 'id' | 'bounds' | 'name'> & {
  name?: string
}

export const parseItemSettings = (str: string) => {
  const flags = str?.split(',').map((v) => v.trim()) ?? []
  const isHidden = flags.includes('hidden')
  const isLocked = flags.includes('locked')
  return { isLocked, isHidden }
}

export const serializeItemSettings = (item: Item) => {
  const flags = []
  if (item.isLocked) flags.push('locked')
  if (item.isHidden) flags.push('hidden')
  return flags.length ? `(${flags.join(', ')})` : ''
}

export const parseItemArgs = (str: string) =>
  str.split(',').map((v) => Number(v.trim()))

export type ItemActions<T = any> = {
  draw: (ctx: CanvasRenderingContext2D, item: T, offset?: Point) => void
  translate: (item: T, delta: Point) => void
  move: (item: T, position: Point) => void
  getBounds: (item: T) => Bounds
  toCode: (item: T, ctx: CodeContext) => string
  fromCode: (code: string) => { item: ParsedItem<T>; length: number } | null
}

// Unfortunately dispatching the item methods based on their `type` property
// doesn't work with typescript, so `any` it is ...
// Keeping the item logic separated and not using OOP/polymorphism is still a
// worth it since we can keep all the state in pinia and implement features
// like history, copy & paste, ... without having to create any class instances.

export const drawItem = (
  ctx: CanvasRenderingContext2D,
  item: Item,
  offset?: Point,
) => {
  if (item.isHidden) return
  items[item.type].draw(ctx, item as any, offset)
}

export const translateItem = (item: Item, delta: Point) =>
  items[item.type].translate(item as any, delta)

export const moveItem = (item: Item, position: Point) =>
  items[item.type].move(item as any, position)

export const getItemBounds = (item: Omit<Item, 'bounds'>): Bounds =>
  items[item.type].getBounds(item as any)

export const itemToCode = (item: Item, ctx: CodeContext): string =>
  items[item.type].toCode(item as any, ctx)

export const itemFromCode = (code: string) => {
  for (const type of itemTypes) {
    const match = items[type].fromCode(code)
    if (match) return match
  }
}
