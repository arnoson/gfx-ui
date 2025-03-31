<script setup lang="ts">
import { computed, nextTick, ref, toRaw, useTemplateRef } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import { vEditable } from '~/directives/editable'
import { useEditor } from '~/stores/editor'
import FrameCanvas from './FrameCanvas.vue'
import type { Frame } from '~/frame'
import { useProject } from '~/stores/project'
import IconDrag from '~/assets/icons/icon-drag.svg'

const editor = useEditor()
const project = useProject()
const components = useTemplateRef('components')

const add = async () => {
  const component = project.addComponent({})
  editor.activateFrame(component.id)
  await nextTick()
  components.value
    ?.querySelector<HTMLElement>(`[data-id='${component.id}']`)
    ?.focus()
}

const remove = (component: Frame) => project.removeComponent(component.id)

let copiedComponent: Frame | null = null
const copy = (component: Frame) => (copiedComponent = component)

const paste = () => {
  if (!copiedComponent) return
  const clone = structuredClone(toRaw(copiedComponent)) as Partial<Frame>
  delete clone.id
  clone.name = `${copiedComponent.name} Copy`
  project.addFrame(clone)
}

const rename = (component: Frame, e: Event) => {
  component.name = (e.target as HTMLElement).textContent ?? ''
}

const componentsList = computed({
  get: () => project.components,
  set: (value) => (project.components = value),
})

const isDragging = ref(false)
useDraggable(components, componentsList, {
  onStart: () => (isDragging.value = true),
  onEnd: () => (isDragging.value = false),
  handle: '.drag-handle',
})
</script>

<template>
  <div class="panel">
    <header class="header">
      <h2>
        {{ project.components.length }}
        {{ project.components.length === 1 ? 'Component' : 'Components' }}
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
      class="components"
      ref="components"
      tabindex="-1"
      :data-dragging="isDragging"
      @keydown.ctrl.v.stop="paste"
    >
      <a
        v-for="component of project.components.values()"
        class="component"
        :key="component.id"
        :href="`#/frame/${component.id}`"
        :data-active="editor.activeFrame?.id === component.id"
        :data-id="component.id"
        @keydown.delete="remove(component)"
        @keydown.c.ctrl="copy(component)"
      >
        <FrameCanvas class="canvas" :frame="component" />
        <IconDrag class="drag-handle" />
        <header
          class="component-name"
          v-editable
          @blur="rename(component, $event)"
          @keydown.delete.stop
        >
          {{ component.name }}
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

.components {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  grid-auto-rows: max-content;
  align-items: start;
  gap: 1rem;
  padding-inline: 1rem;
  padding-bottom: 1rem;
  flex: 1;
  overflow-y: auto;
}

.component {
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

  .components[data-dragging='false']:not(:has(.component:focus))
    &[data-active='true'] {
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

    .component:not(:hover) & {
      display: none;
    }
  }
}

.component-name {
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
