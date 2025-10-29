<script setup lang="ts">
import { CheckboxField } from 'tool-toolkit'
import { useDevice } from '~/stores/device'
import { useProject } from '~/stores/project'

const device = useDevice()
const project = useProject()
</script>

<template>
  <div class="field">
    <label>Device</label>
    <button
      v-if="device.isConnected"
      @click="device.disconnect()"
      :disabled="!device.hasWebSerial"
    >
      disconnect
    </button>
    <button v-else @click="device.connect()" :disabled="!device.hasWebSerial">
      connect
    </button>
  </div>
  <CheckboxField v-model="project.settings.rememberDevice" label="Remember" />
</template>
