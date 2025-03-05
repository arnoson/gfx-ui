<script setup lang="ts">
import { useEditor } from '~/stores/editor'

const editor = useEditor()
</script>

<template>
  <menu>
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
button[data-active='true'] {
  background-color: red;
}
</style>
