<script setup lang="ts">
import { CheckboxField, SizeField } from 'tool-toolkit'
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
      style="background-color: var(--color-accent)"
    >
      disconnect
    </button>
    <button v-else @click="device.connect()" :disabled="!device.hasWebSerial">
      connect
    </button>
  </div>
  <CheckboxField v-model="project.settings.rememberDevice" label="Remember" />
  <SizeField v-model="device.displaySize" label="Display" />
</template>
