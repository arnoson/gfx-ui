import { defineStore } from 'pinia'
import type { Group } from '~/items/group'
import { itemFromCode, itemToCode } from '~/items/item'
import type { Size } from '~/types'
import { sanitizeIdentifier } from '~/utils/identifier'
import { useEditor, type Frame } from './editor'
import { useFonts } from './fonts'

export const useProject = defineStore('project', () => {
  const editor = useEditor()
  const fonts = useFonts()

  const indentLines = (str: string, indent: string) =>
    str
      .split('\n')
      .map((line) => indent + line)
      .join('\n')

  const save = () => {
    let code = ''

    let nameCount: Record<string, number> = {}
    const getUniqueName = (name: string) => {
      nameCount[name] ??= 0
      if (nameCount[name] > 0) name += `_${nameCount[name]}`
      return name
    }

    for (const frame of editor.frames) {
      console.log(frame)
      const name = getUniqueName(frame.name)
      const identifier = sanitizeIdentifier(name)
      code += `void drawFrame${identifier}() { // ${name} (${frame.size.width}x${frame.size.height})\n`
      for (let item of frame.children.toReversed()) {
        code += indentLines(itemToCode(item, getUniqueName), '  ') + '\n'
      }
      code += `};\n\n`
    }

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

  const load = (code: string) => {
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
          console.log(pos, frameMatch)
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

  return { load, save }
})
