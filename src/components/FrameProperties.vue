<script setup lang="ts">
import { SizeField } from 'tool-toolkit'
import type { Frame } from '~/frame'
import { useHistory } from '~/stores/history'

defineProps<{ frame: Frame }>()
const history = useHistory()
</script>

<template>
  <div class="flow">
    <SizeField
      v-model="frame.size"
      @update:model-value="history.saveStateDebounced()"
      label="Size"
    />
  </div>
</template>
