import { itemToCode, type Item } from './items/item'
import type { CodeContext, Size } from './types'
import { sanitizeIdentifier } from './utils/identifier'

export interface Frame {
  type: 'frame'
  id: number
  name: string
  isComponent: boolean
  scale: number
  size: Size
  children: Item[]
}

const indentLines = (str: string, indent: string) =>
  str
    .split('\n')
    .map((line) => indent + line)
    .join('\n')

export const toCode = (frame: Frame, ctx: CodeContext): string => {
  let code = ''
  const name = ctx.getUniqueName(frame.name)
  const identifier = sanitizeIdentifier(name)

  const args = ctx.includeOffset ? `int x, int y` : ''
  const type = frame.isComponent ? 'Component' : 'Frame'

  code += `void draw${type}${identifier}(${args}) {`
  if (ctx.comments === 'names') {
    code += ` // ${name}`
  } else if (ctx.comments === 'all') {
    code += ` // ${name} (${frame.size.width}x${frame.size.height})`
  }
  code += '\n'

  for (let item of frame.children.toReversed()) {
    code += indentLines(itemToCode(item, ctx), '  ') + '\n'
  }

  code += `};`
  return code
}
