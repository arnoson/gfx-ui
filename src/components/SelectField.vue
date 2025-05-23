<script setup lang="ts" generic="T">
import { getInputId } from '~/utils/id'
import { useSlots } from 'vue'

type Option = { value: T; label: string }
type OptionGroup = { label: string; options: Option[] }

defineProps<{
  label: string
  options: (Option | OptionGroup)[]
  allowEmpty?: boolean
}>()
const model = defineModel<T>({ required: true })
const id = getInputId()
const infoId = `info-${id}`

const slots = useSlots()
const hasInfo = !!slots.info

const isOptionsGroup = (v: any): v is OptionGroup => !!v.options
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <div class="fu">
      <select
        :id="id"
        v-model="model"
        :aria-describedby="hasInfo ? infoId : undefined"
      >
        <option v-if="allowEmpty" value="">–</option>
        <template v-for="option of options">
          <optgroup v-if="isOptionsGroup(option)" :label="option.label">
            <option v-for="{ value, label } of option.options" :value>
              {{ label }}
            </option>
          </optgroup>
          <option v-else :value="option.value">{{ option.label }}</option>
        </template>
      </select>
      <slot name="settings"></slot>
    </div>
    <div class="info" v-if="hasInfo" :id="`info-${id}`">
      <slot name="info"></slot>
    </div>
  </div>
</template>

<style scoped>
.info {
  color: hsl(0 0% 50% / 1);
  padding-inline: 0.5rem;
  grid-column: span 2;
}

select {
  min-width: 0;
  width: 100%;
}

.fu {
  display: flex;
  flex-direction: row;
  gap: 1ch;

  select {
    flex: 1;
  }
}
</style>
