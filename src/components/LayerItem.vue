<script setup lang="ts">
import { computed } from 'vue'
import IconInvisible from '~/assets/icons/icon-invisible.svg'
import IconLocked from '~/assets/icons/icon-locked.svg'
import IconUnlocked from '~/assets/icons/icon-unlocked.svg'
import IconVisible from '~/assets/icons/icon-visible.svg'
import type { Item } from '~/items/item'
import { useEditor } from '~/stores/editor'
import { useHistory } from '~/stores/history'
import { useProject } from '~/stores/project'
import InlineEdit from './InlineEdit.vue'
import LayerIcon from './LayerIcon.vue'

const props = defineProps<{ item: Item }>()
const editor = useEditor()
const project = useProject()
const history = useHistory()

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

const removeSelectedItems = () => {
  for (const item of editor.selectedItems) {
    if (item === editor.focusedItem) editor.focusedItem = null
    project.removeItem(item)
  }
  editor.selectedItems.clear()
  history.saveState()
}

const handleMouseDown = (e: MouseEvent) => {
  if (e.ctrlKey) {
    editor.focusedItem = null
    editor.selectedItems.add(props.item)
  } else if (e.shiftKey && editor.selectedItems.size) {
    // Find range bounds from current selection.
    const { selectedItems, itemsFlat } = editor
    const currentIndex = itemsFlat.indexOf(props.item)
    const selectedIndexes = [...selectedItems].map((v) => itemsFlat.indexOf(v))
    const [fromIndex, toIndex] = [
      Math.min(...selectedIndexes),
      Math.max(...selectedIndexes),
    ]

    // First add non-group items.
    editor.blur()
    const rangeStart = Math.min(currentIndex, fromIndex)
    const rangeEnd = Math.max(currentIndex, toIndex)
    for (let i = rangeStart; i <= rangeEnd; i++) {
      const item = itemsFlat[i]
      if (item.type !== 'group') {
        selectedItems.add(item)
      }
    }

    // Add clicked group's children if applicable.
    if (props.item.type === 'group') {
      props.item.children.forEach((child) => selectedItems.add(child))
    }

    // Replace fully selected group children with their parent group.
    for (const item of itemsFlat) {
      if (
        item.type === 'group' &&
        item.children.every((child) => selectedItems.has(child))
      ) {
        selectedItems.add(item)
        item.children.forEach((child) => selectedItems.delete(child))
      }
    }
  } else {
    editor.focusItem(props.item)
  }
}
</script>

<template>
  <div class="layer">
    <button
      class="name"
      @mousedown="handleMouseDown"
      @keydown.delete="removeSelectedItems"
    >
      <LayerIcon :item="item" class="icon" />
      <div class="name-name">
        <InlineEdit
          v-model="item.name"
          @update:model-value="history.saveState()"
        />
      </div>
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

    /* Make sure the inline edit input isn't cropped by overflow hidden. */
    padding-inline: 4px;
    input {
      width: 100%;
    }
  }
}

.actions {
  display: flex;
  gap: 0.25rem;
  padding-right: 0.25rem;

  .layer:focus-within &,
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
