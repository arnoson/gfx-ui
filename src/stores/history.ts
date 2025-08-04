import { useDebounceFn } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { isProxy, isReactive, isRef, ref, toRaw } from 'vue'
import type { Frame } from '~/frame'
import { useEditor } from './editor'
import { useStorage } from './storage'

type Id = Frame['id']

type State = Omit<Frame, 'scale'>

type History = {
  index: number
  stack: State[]
}

const deepToRaw = <T>(sourceObj: T): T => {
  const objectIterator = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map((item) => objectIterator(item))
    }
    if (isRef(input) || isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input))
    }
    if (input && typeof input === 'object') {
      return Object.keys(input).reduce((acc, key) => {
        acc[key as keyof typeof acc] = objectIterator(input[key])
        return acc
      }, {} as T)
    }
    return input
  }

  return objectIterator(sourceObj)
}

const clone = <T>(value: T): T => structuredClone(deepToRaw(value))

const frameToState = (frame: Frame) => {
  // Discard the scale, as we don't want it to change on undo/redo
  const { scale, ...state } = clone(frame)
  return state
}

export const useHistory = defineStore('history', () => {
  const editor = useEditor()
  const storage = useStorage()

  const histories = ref(new Map<Id, History>())
  const maxStackSize = 50

  const add = (frame: Frame) => {
    const initialState = frameToState(frame)
    histories.value.set(frame.id, { index: 0, stack: [initialState] })
  }
  const remove = (id: Id) => histories.value.delete(id)

  const undo = (frame = editor.activeFrame) => {
    if (!frame) return

    const history = histories.value.get(frame.id)
    if (!history || !history.stack.length || history.index < 1) return

    history.index--
    const state = history.stack.at(history.index)
    if (!state) return

    Object.assign(frame, clone(state))
    editor.blur()
  }

  const redo = (frame = editor.activeFrame) => {
    if (!frame) return

    const history = histories.value.get(frame.id)
    if (!history || history.index >= history.stack.length - 1) return

    history.index++
    const state = history.stack.at(history.index)
    if (!state) return

    Object.assign(frame, clone(state))
    editor.blur()
  }

  const saveState = (frame = editor.activeFrame) => {
    if (!frame) return

    let history = histories.value.get(frame.id)
    if (!history) return

    // We undo-ed into history and because we start a new future we have to
    // delete the existing future stack.
    if (history.index < history.stack.length - 1) {
      history.stack.splice(history.index + 1)
    }

    frame.version++
    const state = frameToState(frame)
    history.stack.push(state)
    storage.backupFrame(state)

    if (history.stack.length > maxStackSize) history.stack.shift()
    history.index = history.stack.length - 1
  }

  const saveStateDebounced = useDebounceFn(saveState, 250)

  const clear = () => histories.value.clear()

  return {
    histories,
    add,
    remove,
    undo,
    redo,
    saveState,
    saveStateDebounced,
    clear,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useHistory, import.meta.hot))
