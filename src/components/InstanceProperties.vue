<script setup lang="ts">
import { computed } from 'vue'
import type { Instance } from '~/items/instance'
import { useProject } from '~/stores/project'
import SelectField from './SelectField.vue'
import { useHistory } from '~/stores/history'

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
      @update:model-value="history.saveState()"
      :options="componentOptions"
      label="Component"
    />
  </div>
</template>
