import { itemToCode } from './items/item'
import type { Frame } from './stores/editor'
import { sanitizeIdentifier } from './utils/identifier'

const indentLines = (str: string, indent: string) =>
  str
    .split('\n')
    .map((line) => indent + line)
    .join('\n')

export const toCode = (
  frame: Frame,
  getUniqueName: (name: string) => string,
): string => {
  let code = ''
  const name = getUniqueName(frame.name)
  const identifier = sanitizeIdentifier(name)
  code += `void drawFrame${identifier}() { // ${name} (${frame.size.width}x${frame.size.height})\n`
  for (let item of frame.children.toReversed()) {
    code += indentLines(itemToCode(item, getUniqueName), '  ') + '\n'
  }
  code += `};\n\n`
  return code
}
