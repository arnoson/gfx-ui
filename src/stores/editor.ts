import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDraw } from '~/tools/draw'
import { useRect } from '~/tools/rect'
import { useSelect } from '~/tools/select'

export const useEditor = defineStore('editor', () => {
  const draw = useDraw()
  const select = useSelect()
  const rect = useRect()
  const tools = { draw, select, rect }

  type ToolId = keyof typeof tools

  const activeToolId = ref<ToolId>('select')
  const activeTool = computed(() => tools[activeToolId.value])

  const activateTool = (id: ToolId) => {
    activeTool.value.deactivate?.()
    activeToolId.value = id
    tools[id].activate?.()
  }

  // Init
  activateTool(activeToolId.value)

  return { activeTool, activeToolId, activateTool }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useEditor, import.meta.hot))
