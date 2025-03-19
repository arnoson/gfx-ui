import type { Tool, ToolConfig } from '~/types'

export const defineTool =
  <R>(id: string, fn: () => R, config: ToolConfig = {}) =>
  (): Tool & R => {
    const result = fn()
    return { id, config, ...result }
  }
