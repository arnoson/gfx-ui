import { downloadFile, stripExtension } from '~/utils/file'
import { useProject } from './project'
import type { Frame } from '~/frame'
import { parse, stringify } from 'superjson'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const useStorage = defineStore('storage', () => {
  const project = useProject()

  const savedVersions = ref(new Map<Frame['id'], Frame['version']>())
  let fileHandle: FileSystemFileHandle | null = null
  const fileType: FilePickerAcceptType = {
    accept: { 'text/plain': '.h' },
    description: 'C++ header file',
  }

  const open = async (fileOrHandle: File | FileSystemFileHandle) => {
    clear()

    const isFileHandle = fileOrHandle instanceof FileSystemFileHandle
    const file = isFileHandle ? await fileOrHandle.getFile() : fileOrHandle
    const code = await file.text()
    if (isFileHandle) fileHandle = fileOrHandle

    project.fromCode(code)
    project.name = stripExtension(file.name)
    savedVersions.value = new Map(
      project.framesAndComponents.map((v) => [v.id, v.version]),
    )

    project.framesAndComponents.forEach(backupFrame)
  }

  const save = async () => {
    const code = project.toCode()

    if (fileHandle) {
      fileHandle ??= await window.showSaveFilePicker({
        types: [fileType],
        id: `gfx-ui-${project.name}`,
        suggestedName: project.name,
      })

      const writable = await fileHandle.createWritable()
      await writable.write(new TextEncoder().encode(code))
      await writable.close()
    } else {
      downloadFile(`${project.name}.h`, code)
    }

    savedVersions.value = new Map(
      project.framesAndComponents.map((v) => [v.id, v.version]),
    )
  }

  const backupFrame = (frame: Omit<Frame, 'scale'>) => {
    localStorage.setItem(`gfxui:frame-${frame.id}`, stringify(frame))
  }

  const backupFrameDebounced = useDebounceFn(backupFrame, 2000)

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
    fileType,
    hasUnsavedChanges,
    open,
    save,
    backupFrame,
    backupFrameDebounced,
    restoreBackup,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useStorage, import.meta.hot))
