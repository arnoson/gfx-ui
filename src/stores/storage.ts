import { downloadFile } from '~/utils/file'
import { useProject } from './project'
import type { Frame } from '~/frame'
import { parse, stringify } from 'superjson'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useStorage = defineStore('storage', () => {
  const project = useProject()

  const supportsFileAccessApi = 'showOpenFilePicker' in window
  const savedVersions = ref(new Map<Frame['id'], Frame['version']>())

  let fileHandle: FileSystemFileHandle | null = null
  const fileType: FilePickerAcceptType = { accept: { 'text/plain': '.h' } }

  const open = async () => {
    ;[fileHandle] = await window.showOpenFilePicker({ types: [fileType] })
    const file = await fileHandle.getFile()
    const code = await file.text()
    project.fromCode(code)
  }

  const save = async () => {
    const code = project.toCode()

    fileHandle ??= await window.showSaveFilePicker({
      types: [fileType],
      id: `gfx-ui-${project.name}`,
      suggestedName: project.name,
    })

    const writable = await fileHandle.createWritable()
    await writable.write(new TextEncoder().encode(code))
    await writable.close()

    savedVersions.value = new Map(
      project.framesAndComponents.map((v) => [v.id, v.version]),
    )
  }

  const download = () => {
    const code = project.toCode()
    downloadFile(`${project.name}.h`, code)
  }

  const backupFrame = useDebounceFn((frame: Omit<Frame, 'scale'>) => {
    localStorage.setItem(`gfxui:frame-${frame.id}`, stringify(frame))
  }, 5000)

  const restoreBackup = () => {
    for (const [key, serialized] of Object.entries(localStorage)) {
      if (!key.startsWith('gfxui:frame-')) continue
      if (!serialized) continue

      const frame = parse<Frame>(serialized)
      if (frame.isComponent) project.addComponent(frame)
      else project.addFrame(frame)
    }
  }

  const clear = () => {
    fileHandle = null
    savedVersions.value.clear()

    // Only remove frames, we'll keep the settings.
    for (const key in localStorage) {
      if (!key.startsWith('gfxui:frame-')) continue
      localStorage.removeItem(key)
    }
  }

  const hasUnsavedChanges = computed(() =>
    project.framesAndComponents.some(
      (v) => v.version !== (savedVersions.value.get(v.id) ?? 0),
    ),
  )

  return {
    supportsFileAccessApi,
    hasUnsavedChanges,
    open,
    save,
    download,
    backupFrame,
    restoreBackup,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStorage, import.meta.hot))
