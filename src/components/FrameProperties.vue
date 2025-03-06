<script setup lang="ts">
import type { Frame } from '~/stores/frames'
import SizeField from './SizeField.vue'

defineProps<{ frame: Frame }>()
</script>

<template>
  <div class="flow">
    <h2>Frame Properties</h2>
    <SizeField v-model="frame.size" label="Size" />
  </div>
</template>
