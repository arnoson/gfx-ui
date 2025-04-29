import { defineStore } from 'pinia'
import { stringify, parse } from 'superjson'
import { computed, ref } from 'vue'
import { parseFont, type GfxFont } from '~/utils/font'

const builtinFonts = import.meta.glob('/src/assets/fonts/*.h', {
  eager: true,
  query: '?raw',
})

export const useFonts = defineStore('fonts', () => {
  const fonts = ref(new Map<string, GfxFont>())

  const fontsList = computed(() => [...fonts.value.values()])

  const builtInFonts = computed(() =>
    fontsList.value.filter((v) => v.isBuiltIn),
  )
  const customFonts = computed(() =>
    fontsList.value.filter((v) => !v.isBuiltIn),
  )

  const add = (code: string, isBuiltIn = false) => {
    const font = parseFont(code)
    font.isBuiltIn = isBuiltIn
    fonts.value.set(font.name, font)

    if (!isBuiltIn) {
      localStorage.setItem(`gfxui:font-${font.name}`, stringify(font))
    }
  }

  const remove = (name: string) => {
    fonts.value.delete(name)
    localStorage.removeItem(`gfxui:font-${name}`)
  }

  // Init
  for (const font of Object.values(builtinFonts)) {
    add((font as any).default, true)
  }
  for (const key of Object.keys(localStorage)) {
    if (!key?.startsWith('gfxui:font-')) continue

    const font = parse<GfxFont>(localStorage.getItem(key) ?? '')
    fonts.value.set(font.name, font)
  }

  return { fonts, builtInFonts, customFonts, add, remove }
})
