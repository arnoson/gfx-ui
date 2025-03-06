<script setup lang="ts">
import { useEditor } from '~/stores/editor'

const editor = useEditor()
</script>

<template>
  <menu class="tool-bar">
    <button
      @click="editor.activateTool('select')"
      :data-active="editor.activeToolId === 'select'"
    >
      Select
    </button>
    <button
      @click="editor.activateTool('draw')"
      :data-active="editor.activeToolId === 'draw'"
    >
      Draw
    </button>
    <button
      @click="editor.activateTool('rect')"
      :data-active="editor.activeToolId === 'rect'"
    >
      Rect
    </button>
  </menu>
</template>

<style scoped>
.tool-bar {
  display: flex;
  position: absolute;
  top: 1rem;
  right: 1rem;
  flex-direction: column;
  gap: 3px;
  padding: 2px;

  button {
    display: block;
    padding: 1px;

    &[data-active='true'] {
      color: var(--color-accent);
    }

    svg {
      display: block;
    }
  }
}
</style>
