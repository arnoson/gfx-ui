<script setup lang="ts">
import { computed } from 'vue'
import { SelectField } from 'tool-toolkit'
import type { Instance } from '~/items/instance'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'

defineProps<{ item: Instance }>()
const history = useHistory()
const project = useProject()
const componentOptions = computed(() =>
  project.components.map((v) => ({ value: v.id, label: v.name })),
)
</script>

<template>
  <div class="flow">
    <SelectField
      v-model="item.componentId"
      @update:model-value="history.saveStateDebounced()"
      :options="componentOptions"
      label="Component"
    />
  </div>
</template>
