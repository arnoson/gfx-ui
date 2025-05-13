<script setup lang="ts">
import { useDropzone } from 'vue3-dropzone'
import { useProject } from '~/stores/project'
import ModalDialog from './ModalDialog.vue'
import { useTemplateRef } from 'vue'
import { useEditor } from '~/stores/editor'

const project = useProject()
const editor = useEditor()
const saveDialog = useTemplateRef('loadDialog')

const onDrop = async ([file]: File[]) => {
  if (editor.frames.length) {
    const result = await saveDialog.value?.prompt()
    if (!result) return
    if (result === 'save') project.save()
  }

  const code = await file.text()
  project.importCode(code)
  project.name = file.name.split('.').slice(0, -1).join('.')
}

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
})

const openFile = (e: Event) => {
  if ('showOpenFilePicker' in window) {
    e.preventDefault()
    e.stopPropagation()
    project.open()
  }
}
</script>

<template>
  <div
    v-bind="getRootProps()"
    class="drop-zone"
    :data-drag-active="isDragActive"
  >
    <input v-bind="getInputProps()" />
    <button @click="openFile">Open</button>
    <div class="drop-hint">or drop file</div>
  </div>

  <ModalDialog ref="loadDialog" style="margin: auto">
    <form method="dialog" class="flow">
      This will remove all existing frames. oO you want to save your current
      project first?
      <menu>
        <button type="submit" value="dont-save">No</button>
        <button type="submit" value="save" data-theme="positive" autofocus>
          Yes
        </button>
      </menu>
    </form>
  </ModalDialog>
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
