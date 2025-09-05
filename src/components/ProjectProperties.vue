<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { CheckboxField, FileMenu, ModalDialog } from 'vue-toolkit'
import IconSettings from '~/assets/icons/icon-settings.svg'
import { useDevice } from '~/stores/device'
import { useProject } from '~/stores/project'
import { useStorage } from '~/stores/storage'
import InlineEdit from './InlineEdit.vue'

const project = useProject()
const storage = useStorage()
const device = useDevice()

const clearDialog = useTemplateRef('clearDialog')
const settingsDialog = useTemplateRef('settingsDialog')

const clear = async () => {
  const result = await clearDialog.value?.prompt()
  if (result !== 'submit') return
  project.clear()
  storage.clear()
}
</script>

<template>
  <div class="panel">
    <FileMenu
      :file-type="storage.fileType"
      @open="storage.open($event)"
      @save="storage.save()"
      @clear="clear()"
    />
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
        <button
          v-if="device.isConnected"
          @click="device.disconnect()"
          :disabled="!device.hasWebSerial"
        >
          disconnect
        </button>
        <button
          v-else
          @click="device.connect()"
          :disabled="!device.hasWebSerial"
        >
          connect
        </button>
      </div>
      <CheckboxField
        v-model="project.settings.rememberDevice"
        label="Remember"
      />
    </div>
  </ModalDialog>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  padding: var(--size-4);
  padding-bottom: 0;
}

.name-settings {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
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
</style>
