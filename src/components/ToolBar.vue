<script setup lang="ts">
import { useEditor } from '~/stores/editor'
import SelectIcon from '~/assets/icons/icon-select.svg'
import DrawIcon from '~/assets/icons/icon-draw.svg'
import RectIcon from '~/assets/icons/icon-rect.svg'
import CircleIcon from '~/assets/icons/icon-circle.svg'
import LineIcon from '~/assets/icons/icon-line.svg'
import TextIcon from '~/assets/icons/icon-text.svg'

const editor = useEditor()
</script>

<template>
  <menu class="tool-bar">
    <button
      @click="editor.activateTool('select')"
      :data-active="editor.activeTool.id === 'select'"
    >
      <SelectIcon />
    </button>
    <button
      @click="editor.activateTool('line')"
      :data-active="editor.activeTool.id === 'line'"
    >
      <LineIcon />
    </button>
    <button
      @click="editor.activateTool('rect')"
      :data-active="editor.activeTool.id === 'rect'"
    >
      <RectIcon />
    </button>
    <button
      @click="editor.activateTool('circle')"
      :data-active="editor.activeTool.id === 'circle'"
    >
      <CircleIcon />
    </button>
    <button
      @click="editor.activateTool('text')"
      :data-active="editor.activeTool.id === 'text'"
    >
      <TextIcon />
    </button>
    <button
      @click="editor.activateTool('draw')"
      :data-active="editor.activeTool.id === 'draw'"
    >
      <DrawIcon />
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
      background-color: var(--color-text);
    }

    svg {
      display: block;
    }
  }
}
</style>
