<script setup lang="ts">
import { computed, nextTick, ref, toRaw, useTemplateRef } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import IconDrag from '~/assets/icons/icon-drag.svg'
import type { Frame } from '~/frame'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import FrameCanvas from './FrameCanvas.vue'
import InlineEdit from './InlineEdit.vue'

const editor = useEditor()
const project = useProject()
const history = useHistory()
const frames = useTemplateRef('frames')

const add = async () => {
  const frame = project.addFrame({})
  editor.activateFrame(frame.id)
  await nextTick()
  frames.value?.querySelector<HTMLElement>(`[data-id='${frame.id}']`)?.focus()
}

const remove = (frame: Frame) => project.removeFrame(frame.id)

let copiedFrame: Frame | null = null
const copy = (frame: Frame) => (copiedFrame = frame)

const paste = () => {
  if (!copiedFrame) return
  const clone = structuredClone(toRaw(copiedFrame)) as Partial<Frame>
  delete clone.id
  clone.name = `${copiedFrame.name} Copy`
  project.addFrame(clone)
}

const framesList = computed({
  get: () => project.frames,
  set: (value) => (project.frames = value),
})

const isDragging = ref(false)
useDraggable(frames, framesList, {
  onStart: () => (isDragging.value = true),
  onEnd: () => (isDragging.value = false),
  handle: '.drag-handle',
})
</script>

<template>
  <div class="panel">
    <header class="header">
      <h2>
        {{ project.frames.length }}
        {{ project.frames.length === 1 ? 'Frame' : 'Frames' }}
      </h2>
      <button class="add" @click="add">
        <svg
          class="icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </header>
    <div
      class="frames"
      ref="frames"
      tabindex="-1"
      :data-dragging="isDragging"
      @keydown.ctrl.v.stop="paste"
    >
      <a
        v-for="frame of project.frames.values()"
        class="frame"
        :key="frame.id"
        :href="`#/frame/${frame.id}`"
        :data-active="editor.activeFrame?.id === frame.id"
        :data-id="frame.id"
        @keydown.delete="remove(frame)"
        @keydown.c.ctrl="copy(frame)"
      >
        <FrameCanvas class="canvas" :frame="frame" />
        <IconDrag class="drag-handle" />
        <header class="frame-name">
          <InlineEdit
            v-model="frame.name"
            @update:model-value="history.saveState(frame)"
          />
        </header>
      </a>
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  padding-inline: 1rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.frames {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  grid-auto-rows: max-content;
  align-items: start;
  gap: 1rem;
  padding-inline: 1rem;
  padding-bottom: 1rem;
  flex: 1;
  overflow-y: auto;
}

.frame {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 4px;

  &:hover {
    background-color: var(--color-border);
    &[data-active='true'] {
      background-color: var(--color-accent);
    }
  }

  &:focus {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
  }

  .frames[data-dragging='false']:not(:has(.frame:focus)) &[data-active='true'] {
    border-color: var(--color-accent);
  }

  .canvas {
    width: 100%;
    height: auto;
    max-height: 10rem;
    object-fit: contain;
  }

  .drag-handle {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 4px;
    box-sizing: content-box;
    margin: 0.1rem;
    padding: 0.1rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-border);
    cursor: grab;

    .frame:not(:hover) & {
      display: none;
    }
  }
}

.frame-name {
  text-align: center;
  margin-bottom: 0.25em;
}

.add {
  background: none;
  padding: 0;
  border-radius: 9999px;

  .icon {
    display: block;
    height: 1.8em;
    width: auto;

    path {
      stroke: var(--color-panel-background);
      stroke-width: 1.5;
    }
  }
}
</style>
