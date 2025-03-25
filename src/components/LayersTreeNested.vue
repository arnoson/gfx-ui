<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import IconChevron from '~/assets/icons/icon-chevron.svg'
import type { Item } from '~/items/item'
import { useEditor } from '~/stores/editor'
import LayerItem from './LayerItem.vue'

const list = defineModel<Item[]>({ required: true })
const editor = useEditor()

const layers = useTemplateRef('layers')
useDraggable(layers, list, {
  swapThreshold: 1,
  invertSwap: true,
  group: 'layers',
})
</script>

<template>
  <ul ref="layers" tag="ul" class="layers">
    <li
      v-for="item in list"
      :key="item.id"
      :data-highlight="
        editor.focusedItem === item || editor.selectedItems.has(item)
      "
    >
      <details v-if="item.type === 'group'" open>
        <summary class="row">
          <IconChevron class="chevron" />
          <LayerItem :item="item" />
        </summary>
        <LayersTreeNested
          v-if="item.type === 'group'"
          v-model="item.children"
          class="children"
        />
      </details>
      <div v-else class="row">
        <div class="chevron-spacer"></div>
        <LayerItem :item="item" />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.layers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  overflow: hidden;
}

details > summary {
  list-style: none;
}

details[open] {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chevron {
  display: block;
  details[open] > summary & {
    rotate: 90deg;
  }
}

.chevron-spacer {
  width: 12px;
}

.children {
  margin-left: 1rem;
}
</style>
