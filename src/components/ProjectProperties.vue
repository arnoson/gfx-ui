<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useProject } from '~/stores/project'
import InlineEdit from './InlineEdit.vue'
import ModalDialog from './ModalDialog.vue'
import ProjectUpload from './ProjectUpload.vue'

const project = useProject()
const clearDialog = useTemplateRef('clearDialog')

const clear = async () => {
  const result = await clearDialog.value?.prompt()
  if (result === 'submit') project.clear()
}
</script>

<template>
  <div class="panel">
    <ProjectUpload />
    <button @click="project.save()">Save</button>
    <button @click="clear()">Clear</button>
    <h2><InlineEdit v-model="project.name" /></h2>
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
