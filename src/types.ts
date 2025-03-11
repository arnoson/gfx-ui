import type { Ref } from 'vue'
import type { Frame, Item } from './stores/frames'

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
}

/**
 * A 4-bit grayscale color value
 */
export type Color = number

/**
 * A map of color values, where the key is composed of the x and y coordinates.
 * */
export type Pixels = Set<number>

export type ToolContext = {
  frame: Ref<Frame>
}

export type ToolConfig = {
  pointRounding?: 'floor' | 'round' | 'ceil'
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
