import { defineStore } from 'pinia'
import { ref } from 'vue'
import { parseFont, type GfxFont } from '~/utils/font'

export const useFonts = defineStore('fonts', () => {
  const fonts = ref(new Map<string, GfxFont>())

  const add = (code: string) => {
    const font = parseFont(code)
    fonts.value.set(font.name, font)
  }

  const remove = (name: string) => {
    fonts.value.delete(name)
  }

  return { fonts, add, remove }
})
