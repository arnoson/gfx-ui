<script setup lang="ts">
import { useDropzone } from 'vue3-dropzone'
import { useFonts } from '~/stores/fonts'

const fonts = useFonts()

const onDrop = async ([file]: File[]) => {
  const code = await file.text()
  fonts.add(code)
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
})
</script>

<template>
  <div
    v-bind="getRootProps()"
    class="drop-zone"
    :data-drag-active="isDragActive"
  >
    <input v-bind="getInputProps()" />
    <button>Load</button>
    <div class="drop-hint">or drop file</div>
  </div>
</template>

<style scoped>
.drop-zone {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  color: var(--color-panel-background);
  overflow: hidden;

  /* Looks a bit better with the infos below. */
  margin-left: -0.1rem;

  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;

  &[data-drag-active='true'] {
    color: var(--color-text);
    background-color: var(--color-accent);
    border-color: var(--color-accent);

    button {
      background-color: var(--color-text);
    }
  }
}

.drop-hint {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
