<script setup lang="ts">
import type { Frame } from '~/frame'
import SizeField from './SizeField.vue'
import { useHistory } from '~/stores/history'

defineProps<{ frame: Frame }>()
const history = useHistory()
</script>

<template>
  <div class="flow">
    <SizeField
      v-model="frame.size"
      @update:model-value="history.saveState()"
      label="Size"
    />
  </div>
</template>
