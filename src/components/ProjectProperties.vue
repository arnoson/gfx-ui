<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useProject } from '~/stores/project'
import InlineEdit from './InlineEdit.vue'
import ModalDialog from './ModalDialog.vue'
import ProjectUpload from './ProjectUpload.vue'
import IconSettings from '~/assets/icons/icon-settings.svg'
import { useDevice } from '~/stores/device'
import CheckboxField from './CheckboxField.vue'
import { useStorage } from '~/stores/storage'

const project = useProject()
const storage = useStorage()
const device = useDevice()

const clearDialog = useTemplateRef('clearDialog')
const settingsDialog = useTemplateRef('settingsDialog')

const save = () => {
  if (storage.supportsFileAccessApi) storage.save()
  else storage.download()
}

const clear = async () => {
  const result = await clearDialog.value?.prompt()
  if (result !== 'submit') return
  project.clear()
  storage.clear()
}
</script>

<template>
  <div class="panel">
    <div class="load-save">
      <ProjectUpload />
      <button @click="save">Save</button>
      <button @click="clear()">Clear</button>
    </div>
    <div class="name-settings">
      <h2><InlineEdit v-model="project.name" /></h2>
      <div v-if="storage.hasUnsavedChanges" class="unsaved"></div>
      <button @click="settingsDialog?.open()"><IconSettings /></button>
    </div>
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

  <ModalDialog ref="settingsDialog">
    <div class="flow">
      <h2>Settings</h2>
      <div class="field">
        <label>Device</label>
        <button v-if="device.isConnected" @click="device.disconnect()">
          disconnect
        </button>
        <button v-else @click="device.connect()">connect</button>
      </div>
      <CheckboxField
        v-model="project.settings.rememberDevice"
        label="Remember"
      />
    </div>
  </ModalDialog>
</template>

<style scoped>
.load-save {
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  align-items: baseline;
  gap: 0.75rem;
}

.name-settings {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    display: block;
  }

  button {
    padding-inline: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
  }

  .unsaved {
    width: 1.2ch;
    height: 1.2ch;
    background: white;
    display: block;
    border-radius: 100%;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
  padding-bottom: 0;
}
</style>
