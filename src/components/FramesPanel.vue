<script setup lang="ts">
import { toRaw } from 'vue'
import { FramesList } from 'tool-toolkit'
import type { Frame } from '~/frame'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import FrameCanvas from './FrameCanvas.vue'

const editor = useEditor()
const project = useProject()
const history = useHistory()

const add = async () => {
  const frame = project.addFrame({})
  editor.activateFrame(frame.id)
}

const remove = (frame: Frame) => project.removeFrame(frame.id)

const duplicate = (frame: Frame) => {
  const clone = structuredClone(toRaw(frame)) as Partial<Frame>
  delete clone.id
  clone.name = `${frame.name} Copy`
  // TODO: add copy after the source frame.
  project.addFrame(clone)
}

const rename = (frame: Frame, name: string) => {
  frame.name = name
  history.saveState(frame)
}
</script>

<template>
  <FramesList
    ref="frames"
    v-model="project.frames"
    :sortable="true"
    :rename="true"
    :selected="editor.activeFrame?.id"
    size="big"
    @update:selected="$event !== undefined && editor.activateFrame($event)"
    @add="add"
    @remove="remove"
    @duplicate="duplicate"
    @rename="rename"
  >
    <template #preview="{ frame }">
      <FrameCanvas class="canvas" :frame="frame" />
    </template>
  </FramesList>
</template>

<style scoped>
.canvas {
  background-color: var(--color-background);
  padding: var(--size-2);
  padding-bottom: var(--size-1);
}
</style>
