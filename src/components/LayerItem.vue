<script setup lang="ts">
import type { Item } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { vEditable } from '~/directives/editable'
import IconVisible from '~/assets/icons/icon-visible.svg'
import IconInvisible from '~/assets/icons/icon-invisible.svg'
import IconLocked from '~/assets/icons/icon-locked.svg'
import IconUnlocked from '~/assets/icons/icon-unlocked.svg'
import LayerIcon from './LayerIcon.vue'
import { computed } from 'vue'

const props = defineProps<{ item: Item }>()
const editor = useEditor()

const rename = (e: Event) => {
  props.item.name = (e.target as HTMLElement).textContent ?? ''
}

const toggleHidden = () => {
  props.item.isHidden = !props.item.isHidden
  if (props.item.isHidden) {
    if (editor.focusedItem === props.item) editor.focusedItem = null
    editor.selectedItems.delete(props.item)
  }
}

const hasEnabledActions = computed(
  () => props.item.isLocked || props.item.isHidden,
)
</script>

<template>
  <div class="layer">
    <button class="name" @mousedown="editor.focusItem(item)">
      <LayerIcon :item="item" class="icon" />
      <div v-editable @blur="rename" class="name-name">{{ item.name }}</div>
    </button>
    <div class="actions" :data-always-show="hasEnabledActions">
      <button
        class="locked"
        :data-value="item.isLocked"
        @click.prevent="item.isLocked = !item.isLocked"
      >
        <IconLocked v-if="item.isLocked" />
        <IconUnlocked v-else />
      </button>
      <button
        class="hidden"
        :data-value="item.isHidden"
        @click.prevent="toggleHidden"
      >
        <IconInvisible v-if="item.isHidden" />
        <IconVisible v-else />
      </button>
    </div>
  </div>
</template>

<style scoped>
.layer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 3px;
  flex: 1;
  overflow: hidden;
}

.name {
  flex: 1;
  text-align: left;
  background: none;
  color: var(--color-text);
  align-items: center;
  display: flex;
  gap: 0.5rem;
  padding-inline: 0.2rem;
  overflow: hidden;

  .icon {
    flex-shrink: 0;
  }

  .name-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.actions {
  display: flex;
  gap: 0.25rem;
  padding-right: 0.25rem;

  .layer:not(:hover) &[data-always-show='false'] {
    display: none;
  }
}

.locked,
.hidden {
  display: flex;
  align-items: center;
  background: none;
  padding: 0;

  .layer:not(:hover) &[data-value='false'] {
    visibility: hidden;
  }
}

.layer:hover {
  background-color: var(--color-grid);
}

[data-highlight='true'] .layer {
  background-color: var(--color-accent);
}
</style>
