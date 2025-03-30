import type { Bounds, CodeContext, Point } from '~/types'
import {
  drawItem,
  parseItemArgs,
  parseItemSettings,
  serializeItemSettings,
  type ItemActions,
} from './item'
import { useEditor } from '~/stores/editor'
import { emptyBounds, makeBounds } from '~/utils/bounds'
import { commentRegex, composeRegex, metaRegex } from '~/utils/regex'
import { useProject } from '~/stores/project'

export interface Instance {
  type: 'instance'
  id: number
  name: string
  position: Point
  componentId: Number
  isHidden: boolean
  isLocked: boolean
  bounds: null
}

const draw = (ctx: CanvasRenderingContext2D, instance: Instance) => {
  const project = useProject()
  const component = project.components.find(
    (v) => v.id === instance.componentId,
  )
  if (!component) return

  for (const child of component.children)
    drawItem(ctx, child, instance.position)
}

const move = (instance: Instance, position: Point) => {
  instance.position = position
}

const translate = (instance: Instance, delta: Point) => {
  instance.position.x += delta.x
  instance.position.y += delta.y
}

const getBounds = (instance: Instance) => {
  const project = useProject()
  const component = project.components.find(
    (v) => v.id === instance.componentId,
  )
  if (!component) return emptyBounds
  return makeBounds(instance.position, component.size)
}

const toCode = (instance: Instance, ctx: CodeContext) => {
  const { position, name, componentId } = instance
  const project = useProject()
  const component = project.components.find((v) => v.id === componentId)
  if (!component) return ''

  const x = ctx.includeOffset ? `x + ${position.x}` : position.x
  const y = ctx.includeOffset ? `y + ${position.y}` : position.y

  let code = `drawComponent${ctx.getUniqueName(component.name)}(${x}, ${y})`
  if (ctx.comments === 'names') {
    code += ` // ${ctx.getUniqueName(name)}`
  } else if (ctx.comments === 'all') {
    code += ` // ${ctx.getUniqueName(name)} ${serializeItemSettings(instance)}`
  }
  return code
}

const regex = composeRegex(
  /^drawComponent(?<componentName>\w+)\((?<args>.+)\); /,
  commentRegex,
  metaRegex,
)

const fromCode = (code: string) => {
  const match = code.match(regex)
  if (!match?.groups) return null

  const { componentName, args, name, settings } = match.groups
  const { isLocked, isHidden } = parseItemSettings(settings)
  const { length } = match[0]

  const editor = useEditor()
  // const component = editor.components.fin

  const [x, y] = parseItemArgs(args)
  const item = {
    type: 'instance' as const,
    name,
    componentId: 0,
    position: { x, y },
    isLocked,
    isHidden,
  }

  return { item, length }
}

export const instance: ItemActions<Instance> = {
  draw,
  move,
  translate,
  getBounds,
  toCode,
  fromCode,
}
