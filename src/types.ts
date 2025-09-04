import type { Component } from 'vue'
import type { DrawContext, Item } from './items/item'

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type Point = {
  x: number
  y: number
}

export type Size = { width: number; height: number }

export interface Bounds {
  x: number
  y: number
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  topLeft: Point
  topRight: Point
  bottomRight: Point
  bottomLeft: Point
  center: Point
}

export type Corner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'

/**
 * A 4-bit grayscale color value
 */
export type Color = number

/**
 * A map of color values, where the key is composed of the x and y coordinates.
 * */
export type Pixels = Set<number>

export interface Tool {
  id: string
  icon: Component | string
  shortcut?: string
  pointRounding?: 'floor' | 'round' | 'ceil'
  onMouseDown?: (point: Point) => unknown
  onMouseMove?: (point: Point) => unknown
  onMouseUp?: (point: Point) => unknown
  onKeyDown?: (e: KeyboardEvent) => unknown
  activate?: () => void
  deactivate?: () => void
}

export interface ItemActions {
  draw: (ctx: DrawContext, item: Item) => void
  translate: (item: Item, delta: Point) => void
  move: (item: Item, position: Point) => void
  getBounds: (item: Item) => Bounds
}

export type CodeContext = {
  getUniqueName: (name: string) => string
  comments: 'none' | 'names' | 'all'
  includeOffset: boolean
}
