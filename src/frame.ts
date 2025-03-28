import { itemToCode } from './items/item'
import type { Frame } from './stores/editor'
import type { CodeContext } from './types'
import { sanitizeIdentifier } from './utils/identifier'

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

  code += `void drawFrame${identifier}(${args}) {`
  if (ctx.comments) {
    code + `// ${name} (${frame.size.width}x${frame.size.height})`
  }
  code += '\n'

  for (let item of frame.children.toReversed()) {
    code += indentLines(itemToCode(item, ctx), '  ') + '\n'
  }

  code += `};`
  return code
}
