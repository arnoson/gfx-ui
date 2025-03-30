<script setup lang="ts">
import { computed, nextTick, ref, toRaw, useTemplateRef } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import { vEditable } from '~/directives/editable'
import { useEditor } from '~/stores/editor'
import FrameCanvas from './FrameCanvas.vue'
import type { Frame } from '~/frame'
import { useProject } from '~/stores/project'

const editor = useEditor()
const project = useProject()
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

const rename = (frame: Frame, e: Event) => {
  frame.name = (e.target as HTMLElement).textContent ?? ''
}

const framesList = computed({
  get: () => project.frames,
  set: (value) => (project.frames = value),
})

const isDragging = ref(false)
useDraggable(frames, framesList, {
  onStart: () => (isDragging.value = true),
  onEnd: () => (isDragging.value = false),
})
</script>

<template>
  <div class="panel">
    <header class="header">
      <h2>
        {{ editor.frames.length }}
        {{ editor.frames.length === 1 ? 'Frame' : 'Frames' }}
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
        <header
          class="frame-name"
          v-editable
          @blur="rename(frame, $event)"
          @keydown.delete.stop
        >
          {{ frame.name }}
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
