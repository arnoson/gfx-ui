<script setup lang="ts">
import { useMagicKeys } from '@vueuse/core'
import { toRaw } from 'vue'
import { FramesList } from 'vue-toolkit'
import type { Frame } from '~/frame'
import type { Instance } from '~/items/instance'
import { getItemBounds } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import { mouseToSvg } from '~/utils/mouse'
import { addPoints, subtractPoints } from '~/utils/point'
import FrameCanvas from './FrameCanvas.vue'

const editor = useEditor()
const project = useProject()
const history = useHistory()

const add = () => {
  const component = project.addComponent({})
  editor.activateFrame(component.id)
}

const remove = (component: Frame) => project.removeComponent(component.id)

const duplicate = (component: Frame) => {
  const clone = structuredClone(toRaw(component)) as Partial<Frame>
  delete clone.id
  clone.name = `${component.name} Copy`
  project.addComponent(clone)
}

const { ctrl: snapDisabled } = useMagicKeys()
let currentComponent: Frame | null = null
let draggingInstance: Instance | null = null
let editorEl: HTMLElement | null = null
let dragDelta = { x: 0, y: 0 }

const dragStart = (e: MouseEvent, component: Frame) => {
  if (editor.activeFrame === component) return

  currentComponent = component
  dragDelta = {
    x: Math.round(currentComponent.size.width / 2),
    y: Math.round(currentComponent.size.height / 2),
  }

  editorEl = document.querySelector('.editor')
}

const drag = (e: MouseEvent) => {
  if (!currentComponent) return

  const point = mouseToSvg(e, editorEl!.querySelector('svg')!, 'floor')
  const position = subtractPoints(point, dragDelta)

  if (!draggingInstance) {
    draggingInstance ??= project.addItem({
      type: 'instance',
      componentId: currentComponent.id,
      name: currentComponent.name,
      position,
    })!
  }

  if (snapDisabled.value) {
    draggingInstance.position = position
  } else {
    const bounds = getItemBounds(draggingInstance)
    const snapAmount = editor.snapBounds(bounds, [draggingInstance])
    draggingInstance.position = addPoints(position, snapAmount)
  }
}

const dragEnd = (e: MouseEvent) => {
  const isInsideEditor = editorEl?.contains(e.target as HTMLElement)
  if (isInsideEditor) history.saveState()
  else if (draggingInstance) project.removeItem(draggingInstance)

  currentComponent = null
  draggingInstance = null
  editor.resetSnapGuides()
}

const dragCancel = () => {
  if (draggingInstance) project.removeItem(draggingInstance)
  currentComponent = null
  draggingInstance = null
  editor.resetSnapGuides()
}
</script>

<template>
  <FramesList
    v-model="project.components"
    :sortable="true"
    :selected="editor.activeFrame?.id"
    @update:selected="$event !== undefined && editor.activateFrame($event)"
    @add="add"
    @remove="remove"
    @duplicate="duplicate"
    @drag="drag"
    @drag-start="dragStart"
    @drag-cancel="dragCancel"
    @drag-end="dragEnd"
  >
    <template #preview="{ frame }">
      <FrameCanvas class="canvas" :frame />
    </template>
  </FramesList>
</template>
