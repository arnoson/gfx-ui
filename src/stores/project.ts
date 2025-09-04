import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { toCode as frameToCode, type Frame } from '~/frame'
import type { Group } from '~/items/group'
import {
  getItemBounds,
  itemFromCode,
  type Item,
  type ItemByType,
  type ItemType,
} from '~/items/item'
import type { CodeContext, Optional, Size } from '~/types'
import { createCodeContext } from '~/utils/codeContext'
import { serializeFont } from '~/utils/font'
import { capitalizeFirstLetter } from '~/utils/text'
import { useEditor } from './editor'
import { useFonts } from './fonts'
import { useHistory } from './history'
import { getMaxTreeId } from '~/utils/tree'

type Id = number
let nextId = 0
const createId = () => nextId++

export const useProject = defineStore('project', () => {
  const history = useHistory()
  const editor = useEditor()
  const fonts = useFonts()

  const name = useStorage('gfxui:project-name', 'Untitled')
  const settings = useStorage('gfxui:settings', { rememberDevice: true })

  // TODO: move this into settings
  const codeSettings = ref<Omit<CodeContext, 'getUniqueName'>>({
    comments: 'names',
    includeOffset: false,
  })

  // Frames
  const frames = ref<Frame[]>([])

  const addFrame = (data: Partial<Frame>): Frame => {
    const id = data.id ?? createId()

    frames.value.push({
      type: 'frame' as const,
      isComponent: false,
      children: [],
      ...data,
      id,
      size: data.size ?? { width: 128, height: 64 },
      name: data.name ?? `Frame${id}`,
      scale: data.scale ?? 5,
      version: 0,
    })

    const frame = frames.value.at(-1)!
    nextId = Math.max(nextId, getMaxTreeId(frame) + 1)
    history.add(frame)

    return frame
  }

  const removeFrame = (id: Id) => {
    const index = frames.value.findIndex((v) => v.id === id)
    frames.value.splice(index, 1)
    history.remove(id)
    localStorage.removeItem(`frame-${id}`)
    if (editor.activeFrame?.id === id) editor.activeFrame = undefined
  }

  // Components
  const components = ref<Frame[]>([])

  const addComponent = (data: Partial<Frame>): Frame => {
    const id = data.id ?? createId()

    components.value.push({
      type: 'frame' as const,
      isComponent: true,
      children: [],
      ...data,
      id,
      size: data.size ?? { width: 128, height: 64 },
      name: data.name ?? `Frame${id}`,
      scale: data.scale ?? 5,
      version: 0,
    })

    const component = components.value.at(-1)!
    nextId = Math.max(nextId, getMaxTreeId(component) + 1)
    history.add(component)

    return component
  }

  const removeComponent = (id: Id) => {
    const index = components.value.findIndex((v) => v.id === id)
    components.value.splice(index, 1)
    localStorage.removeItem(`gfxui:frame-${id}`)
  }

  // Frames & Components
  const framesAndComponents = computed(() => [
    ...frames.value,
    ...components.value,
  ])

  // Items
  const items = computed(() => editor.activeFrame?.children ?? [])

  type OptionalProps = 'id' | 'name' | 'bounds' | 'isLocked' | 'isHidden'
  type ItemData = {
    [K in ItemType]: Optional<ItemByType<K>, OptionalProps>
  }[ItemType]

  const addItem = <T extends ItemData, R = ItemByType<T['type']>>(
    data: T,
  ): R | undefined => {
    if (!editor.activeFrame) return

    const id = data.id ?? createId()
    const name = capitalizeFirstLetter(data.type)

    const itemWithoutBounds: Omit<Item, 'bounds'> = {
      name,
      isLocked: false,
      isHidden: false,
      ...data,
      id,
    }

    const hasCachedBounds = !['group', 'instance'].includes(data.type)
    const bounds = hasCachedBounds ? getItemBounds(itemWithoutBounds) : null
    const item = { ...itemWithoutBounds, bounds } as Item
    editor.activeFrame.children.unshift(item)

    if (item.id === undefined) console.error('wtf!!!', { item, nextId })
    nextId = Math.max(nextId, getMaxTreeId(item) + 1)

    return editor.activeFrame.children[0] as R
  }

  const removeItem = (item: Item, frame = editor.activeFrame) => {
    if (!frame) return

    // Since the item doesn't know anything about its parent, we have to find
    // the items parent (the current frame or any group) manually.

    const index = frame.children.findIndex((v) => v.id === item.id)
    if (index !== -1) {
      frame.children.splice(index, 1)
      return
    }

    const queue = [...frame.children]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (current.type === 'group') {
        const index = current.children.findIndex((v) => v.id === item.id)
        if (index !== -1) {
          current.children.splice(index, 1)
          return
        }
        queue.push(...current.children)
      }
    }
  }

  const toCode = () => {
    let code = `/**
 * Created with gfx-ui@${__APP_VERSION__} (github.com/arnoson/gfx-ui): a web based graphic editor for creating Adafruit GFX graphics.
 */\n\n`

    const customFonts = [...fonts.fonts.values()].filter((v) => !v.isBuiltIn)
    for (const font of customFonts) {
      code += '// font-start\n'
      code += serializeFont(font)
      code += '// font-end\n\n\n'
    }

    const ctx = createCodeContext({ comments: 'all', includeOffset: false })
    code += components.value.map((v) => frameToCode(v, ctx)).join('\n\n')
    code += '\n\n'
    code += frames.value.map((v) => frameToCode(v, ctx)).join('\n\n')

    return code
  }

  const fromCode = (code: string) => {
    clear()
    history.clear()

    let pos = 0
    let ignoredSections: [start: number, end: number][] = []
    let ignoredStart: number | null = null

    let frame: Frame | null = null
    let groups: Group[] = []

    while (pos < code.length) {
      const input = code.slice(pos)

      // Fonts
      const fontMatch = input.match(
        /^\/\/ font-start(?<fontCode>[\s\S]+?)\/\/ font-end/,
      )
      if (fontMatch) {
        fonts.add(fontMatch.groups!.fontCode)
        pos += fontMatch[0].length
        continue
      }

      // Frames/components
      if (!frame) {
        const frameMatch = input.match(
          /^void drawFrame\w+\(\) \{( \/\/ (?<name>[\w ]+) \((?<settings>.+)\))?/,
        )
        if (frameMatch) {
          const { name, settings } = frameMatch.groups!
          const { size } = parseFrameSettings(settings)
          frame = addFrame({ name, size })
          if (frame) editor.activateFrame(frame.id)
          pos += frameMatch[0].length
          continue
        }

        const componentMatch = input.match(
          /^void drawComponent\w+\(\) \{( \/\/ (?<name>[\w ]+) \((?<settings>.+)\))?/,
        )
        if (componentMatch) {
          const { name, settings } = componentMatch.groups!
          const { size } = parseFrameSettings(settings)
          frame = addComponent({ name, size })
          if (frame) editor.activateFrame(frame.id)
          pos += componentMatch[0].length
          continue
        }

        pos += 1
        continue
      }

      // Items
      const itemMatch = itemFromCode(input)
      if (itemMatch) {
        if (ignoredStart !== null) {
          ignoredSections.push([ignoredStart, pos])
          ignoredStart = null
        }
        const item = addItem(itemMatch.item)!
        if (item.type === 'text') editor.currentFont = item.font

        // Group start
        const group = groups.at(-1)
        if (group) {
          removeItem(item, frame)
          group.children.unshift(item)
        }

        if (itemMatch.item.type === 'group') {
          groups.push(item as Group)
        }

        pos += itemMatch.length
        continue
      }

      // Group end
      const groupEndMatch = input.match(/^\/\/ group-end/)
      if (groupEndMatch) {
        groups.pop()
        pos += groupEndMatch[0].length
        continue
      }

      // Frame/Component end
      if (input.startsWith('}')) {
        frame = null
        pos += 1
        continue
      }

      ignoredStart ??= pos
      pos += 1
    }

    for (const frame of framesAndComponents.value) resolveInstances(frame)
    for (const frame of framesAndComponents.value) history.saveState(frame)
  }

  const clear = () => {
    frames.value = []
    components.value = []
    editor.activeFrame = undefined
    name.value = 'Untitled'
    nextId = 0
  }

  const parseFrameSettings = (str: string) => {
    const flags = str?.split(',').map((v) => v.trim()) ?? []
    let size: Size | undefined

    const sizeFlag = flags.find((v) => v.match(/\d+x\d+/))
    if (sizeFlag) {
      const [width, height] = sizeFlag.split('x').map(Number)
      size = { width, height }
    }

    return { size }
  }

  const resolveInstances = (frame: Frame) => {
    const queue = [...frame.children]
    while (queue.length > 0) {
      const item = queue.shift()!

      if (item.type === 'instance' && item.componentName) {
        const component = components.value.find(
          (v) => v.name === item.componentName,
        )
        if (component) {
          item.componentId = component.id
          delete item.componentName
        }
      }

      if (item.type === 'group') queue.push(...item.children)
    }
  }

  return {
    name,
    settings,
    codeSettings,

    frames,
    addFrame,
    removeFrame,

    components,
    addComponent,
    removeComponent,

    framesAndComponents,

    items,
    addItem,
    removeItem,

    fromCode,
    toCode,
    clear,
  }
})
