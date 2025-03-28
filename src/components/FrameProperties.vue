<script setup lang="ts">
import type { Frame } from '~/frame'
import SizeField from './SizeField.vue'

defineProps<{ frame: Frame }>()
</script>

<template>
  <div class="flow">
    <SizeField v-model="frame.size" label="Size" />
  </div>
</template>
