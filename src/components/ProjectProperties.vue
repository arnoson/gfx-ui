<script setup lang="ts">
import { useProject } from '~/stores/project'
import ProjectUpload from './ProjectUpload.vue'
import ModalDialog from './ModalDialog.vue'
import { useTemplateRef } from 'vue'
import { useEditor } from '~/stores/editor'
import { vEditable } from '~/directives/editable'

const project = useProject()
const editor = useEditor()
const clearDialog = useTemplateRef('clearDialog')

const clear = async () => {
  const result = await clearDialog.value?.prompt()
  if (result === 'submit') editor.clear()
}

const rename = (e: Event) => {
  project.name = (e.target as HTMLElement).textContent ?? ''
}
</script>

<template>
  <div class="panel">
    <ProjectUpload />
    <button @click="project.save()">Save</button>
    <button @click="clear()">Clear</button>
    <h2 v-editable @blur="rename">{{ project.name }}</h2>
  </div>
  <ModalDialog ref="clearDialog" v-slot="{ close }" style="margin: auto">
    <form method="dialog" class="flow">
      <p>Are you sure? This will remove all frames.</p>
      <menu>
        <button type="reset" @click="close">Cancel</button>
        <button type="submit" value="submit" data-theme="positive" autofocus>
          Clear
        </button>
      </menu>
    </form>
  </ModalDialog>
</template>

<style scoped>
.panel {
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.5rem;
  padding-bottom: 0;
}
</style>
