import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
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
import { capitalizeFirstLetter } from '~/utils/text'
import { useEditor } from './editor'
import { useFonts } from './fonts'
import { useHistory } from './history'
import { useStorage } from '@vueuse/core'
import { parse } from 'superjson'

type Id = number
let id = 0
const createId = () => id++

export const useProject = defineStore('project', () => {
  const history = useHistory()
  const name = ref('Untitled')

  const codeSettings = ref<Omit<CodeContext, 'getUniqueName'>>({
    comments: 'names',
    includeOffset: false,
  })

  // Frames
  const frames = ref<Frame[]>([])

  const addFrame = (data: Partial<Frame>): Frame => {
    const id = createId()
    frames.value.push({
      type: 'frame' as const,
      id,
      isComponent: false,
      children: [],
      ...data,
      size: data.size ?? { width: 128, height: 64 },
      name: data.name ?? `Frame${id}`,
      scale: data.scale ?? 5,
    })
    const frame = frames.value.at(-1)!
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
    const id = createId()
    components.value.push({
      type: 'frame' as const,
      id,
      isComponent: true,
      children: [],
      ...data,
      size: data.size ?? { width: 128, height: 64 },
      name: data.name ?? `Frame${id}`,
      scale: data.scale ?? 5,
    })
    const component = components.value.at(-1)!
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

  const storedFrameIds = useStorage<number[]>('gfxui:frame-ids', [])
  watch(
    framesAndComponents,
    () => (storedFrameIds.value = framesAndComponents.value.map((v) => v.id)),
  )

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

    const id = createId()
    const name = capitalizeFirstLetter(data.type)

    const itemWithoutBounds: Omit<Item, 'bounds'> = {
      id,
      name,
      isLocked: false,
      isHidden: false,
      ...data,
    }

    const hasCachedBounds = !['group', 'instance'].includes(data.type)
    const bounds = hasCachedBounds ? getItemBounds(itemWithoutBounds) : null
    const item = { ...itemWithoutBounds, bounds } as Item
    editor.activeFrame.children.unshift(item)

    return editor.activeFrame.children[0] as R
  }

  const removeItem = (item: Item, frame = editor.activeFrame) => {
    if (!frame) return
    const index = frame.children.findIndex((v) => v.id === item.id)
    frame.children.splice(index, 1)
  }

  const editor = useEditor()
  const fonts = useFonts()

  const save = () => {
    let code = `/**
 * Created with gfx-ui@${__APP_VERSION__} (github.com/arnoson/gfx-ui): a web based graphic editor for creating Adafruit GFX graphics.
 */\n\n`

    const ctx = createCodeContext({ comments: 'all', includeOffset: false })
    code += components.value.map((v) => frameToCode(v, ctx)).join('\n\n')
    code += '\n\n'
    code += frames.value.map((v) => frameToCode(v, ctx)).join('\n\n')

    // downloadFile(`${name.value}.h`, code)
    console.log(code)
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

  const load = (code: string) => {
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

  const restore = () => {
    for (const id of storedFrameIds.value) {
      const serialized = localStorage.getItem(`gfxui:frame-${id}`)
      if (!serialized) continue
      const frame = parse<Frame>(serialized)
      if (frame.isComponent) addComponent(frame)
      else addFrame(frame)
    }
  }

  const clear = (clearStorage = true) => {
    if (clearStorage) {
      for (const id of storedFrameIds.value) {
        localStorage.removeItem(`gfxui:frame-${id}`)
      }
    }
    frames.value = []
    components.value = []
    editor.activeFrame = undefined
  }

  return {
    name,
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

    load,
    save,
    restore,
    clear,
  }
})
