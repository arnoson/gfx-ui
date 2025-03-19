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
      v-for="tool of editor.tools"
      @click="editor.activateTool(tool.id as any)"
      :data-active="editor.activeTool.id === tool.id"
      :title="`${tool.id} ${tool.config?.shortcut}`"
    >
      <SelectIcon v-if="tool.id === 'select'" />
      <LineIcon v-else-if="tool.id === 'line'" />
      <RectIcon v-else-if="tool.id === 'rect'" />
      <CircleIcon v-else-if="tool.id === 'circle'" />
      <TextIcon v-else-if="tool.id === 'text'" />
      <DrawIcon v-else-if="tool.id === 'pencil'" />
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
