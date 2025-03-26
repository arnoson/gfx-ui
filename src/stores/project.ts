import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toCode as frameToCode } from '~/frame'
import type { Group } from '~/items/group'
import { itemFromCode } from '~/items/item'
import type { CodeContext, Size } from '~/types'
import { createCodeContext } from '~/utils/codeContext'
import { downloadFile } from '~/utils/file'
import { useEditor, type Frame } from './editor'
import { useFonts } from './fonts'

export const useProject = defineStore('project', () => {
  const name = ref('Untitled')

  const singleItemComments = ref<CodeContext['comments']>('none')
  const multipleItemsComments = ref<CodeContext['comments']>('names')

  const editor = useEditor()
  const fonts = useFonts()

  const save = () => {
    let code = `/**
    * Created with gfx-ui@${__APP_VERSION__} (github.com/arnoson/gfx-ui): a web based graphic editor for creating Adafruit GFX graphics.
    */\n\n`

    const ctx = createCodeContext({ comments: 'all' })
    code += editor.frames.map((v) => frameToCode(v, ctx)).join('\n\n')

    downloadFile(`${name.value}.h`, code)
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

  const load = (code: string) => {
    editor.clear()

    let pos = 0
    let ignoredSections: [start: number, end: number][] = []
    let ignoredStart: number | null = null

    let frame: Frame | null = null
    let groups: Group[] = []

    while (pos < code.length) {
      const input = code.slice(pos)

      const fontMatch = input.match(
        /^\/\/ font-start(?<fontCode>[\s\S]+?)\/\/ font-end/,
      )
      if (fontMatch) {
        fonts.add(fontMatch.groups!.fontCode)
        pos += fontMatch[0].length
        continue
      }

      if (!frame) {
        const frameMatch = input.match(
          /^drawFrame\w+\(\) \{( \/\/ (?<name>[\w ]+) \((?<settings>.+)\))?/,
        )
        if (frameMatch) {
          const { name, settings } = frameMatch.groups!
          const { size } = parseFrameSettings(settings)
          frame = editor.addFrame({ name, size })
          if (frame) editor.activateFrame(frame.id)
          pos += frameMatch[0].length
        } else {
          pos += 1
        }
        continue
      }

      const itemMatch = itemFromCode(input)
      if (itemMatch) {
        if (ignoredStart !== null) {
          ignoredSections.push([ignoredStart, pos])
          ignoredStart = null
        }
        const item = editor.addItem(itemMatch.item)!

        const group = groups.at(-1)
        if (group) {
          editor.removeItem(item, frame)
          group.children.unshift(item)
        }

        if (itemMatch.item.type === 'group') {
          groups.push(item as Group)
        }

        pos += itemMatch.length
        continue
      }

      const groupEndMatch = input.match(/^\/\/ group-end/)
      if (groupEndMatch) {
        groups.pop()
        pos += groupEndMatch[0].length
        continue
      }

      if (input.startsWith('}')) {
        frame = null
        pos += 1
        continue
      }

      ignoredStart ??= pos
      pos += 1
    }
  }

  return {
    name,
    load,
    save,
    singleItemComments,
    multipleItemsComments,
  }
})
