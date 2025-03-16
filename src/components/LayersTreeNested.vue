<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDraggable } from 'vue-draggable-plus'
import IconChevron from '~/assets/icons/icon-chevron.svg'
import type { Item } from '~/items/item'
import { useEditor } from '~/stores/editor'
import LayerIcon from './LayerIcon.vue'

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
        <summary class="layer">
          <IconChevron class="chevron" />
          <button @mousedown="editor.focusItem(item)">
            <LayerIcon :item="item" />
            {{ item.type }}@{{ item.id }}
          </button>
        </summary>
        <LayersTreeNested
          v-if="item.type === 'group'"
          v-model="item.children"
          class="children"
        />
      </details>
      <div v-else class="layer">
        <div class="chevron-spacer"></div>
        <button @mousedown="editor.focusItem(item)">
          <LayerIcon :item="item" />
          {{ item.type }}@{{ item.id }}
        </button>
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

.layer {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  button {
    flex: 1;
    text-align: left;
    background: none;
    color: var(--color-text);
    align-items: center;
    display: flex;
    gap: 0.5rem;
    padding-inline: 0.2rem;
  }

  button:hover {
    background-color: var(--color-grid);
  }

  [data-highlight='true'] & button {
    background-color: var(--color-accent);
  }
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
