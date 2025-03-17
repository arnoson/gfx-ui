<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { computed } from 'vue'
import FrameEditor from './components/FrameEditor.vue'
import FrameProperties from './components/FrameProperties.vue'
import ItemProperties from './components/ItemProperties.vue'
import LayersTree from './components/LayersTree.vue'
import SelectionProperties from './components/SelectionProperties.vue'
import ToolBar from './components/ToolBar.vue'
import miwos7pt from './fonts/miwos7pt.h?raw'
import { useEditor } from './stores/editor'
import { useFonts } from './stores/fonts'

const editor = useEditor()
const fonts = useFonts()
const frame = editor.addFrame({})
editor.activateFrame(frame.id)

const { width } = useWindowSize()
const sidebarDefaultSize = computed(() => (200 / width.value) * 100)
const sidebarMinSize = computed(() => (175 / width.value) * 100)

// editor.addItem({
//   type: 'line',
//   from: { x: 0, y: 0 },
//   to: { x: 10, y: 10 },
//   color: 15,
// })

editor.addItem({
  type: 'rect',
  position: { x: 10, y: 10 },
  size: { width: 20, height: 8 },
  color: 15,
  isFilled: true,
  radius: 0,
})

editor.addItem({
  type: 'circle',
  center: { x: 30, y: 30 },
  radius: 5,
  color: 15,
  isFilled: false,
})

// fonts.add(miwos7pt)

// editor.addItem({
//   type: 'text',
//   content: 'Hello\nArggggh!',
//   color: 15,
//   font: 'miwos7pt',
//   position: { x: 10, y: 10 },
// })
</script>

<template>
  <SplitterGroup direction="horizontal">
    <SplitterPanel
      :default-size="sidebarDefaultSize"
      :min-size="sidebarMinSize"
    >
      Frames
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel class="editor-panel">
      <FrameEditor v-if="editor.activeFrame" :frame="editor.activeFrame" />
      <ToolBar />
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel
      :default-size="sidebarDefaultSize"
      :min-size="sidebarMinSize"
    >
      <SplitterGroup direction="vertical">
        <SplitterPanel class="properties-panel">
          <ItemProperties
            v-if="editor.focusedItem"
            :item="editor.focusedItem"
          />
          <SelectionProperties
            v-else-if="editor.selectedItems.size"
            :items="Array.from(editor.selectedItems)"
          />
          <FrameProperties
            v-else-if="editor.activeFrame"
            :frame="editor.activeFrame"
          />
        </SplitterPanel>
        <SplitterResizeHandle />
        <SplitterPanel class="layers-panel">
          <LayersTree />
        </SplitterPanel>
      </SplitterGroup>
    </SplitterPanel>
  </SplitterGroup>
</template>

<style scoped>
.editor-panel {
  position: relative;
  padding: 0.3rem;
}

.properties-panel,
.layers-panel {
  padding: 1rem;
}

.layers-panel {
  padding-left: 0.6rem;
}

[data-resize-handle] {
  --size: 5px;
  --margin: 1rem;

  transition: opacity 200ms;

  &[data-state='inactive']:not(:focus) {
    opacity: 0.1;
  }

  background: var(--color-panel-background);
  border-radius: var(--size);

  &[data-orientation='vertical'] {
    height: var(--size);
    margin-inline: var(--margin);
  }

  &[data-orientation='horizontal'] {
    width: var(--size);
    margin-block: var(--margin);
  }
}
</style>
