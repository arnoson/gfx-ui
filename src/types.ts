import type { Ref } from 'vue'
import type { Item } from './items/item'
import type { Frame } from './stores/editor'

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

export type ToolConfig = {
  pointRounding?: 'floor' | 'round' | 'ceil'
  shortcut?: string
}

export interface Tool {
  id: string
  config?: ToolConfig
  onMouseDown?: (point: Point) => unknown
  onMouseMove?: (point: Point) => unknown
  onMouseUp?: (point: Point) => unknown
  onKeyDown?: (e: KeyboardEvent) => unknown
  activate?: () => void
  deactivate?: () => void
}

export interface ItemActions {
  draw: (ctx: CanvasRenderingContext2D, item: Item) => void
  translate: (item: Item, delta: Point) => void
  move: (item: Item, position: Point) => void
  getBounds: (item: Item) => Bounds
}
