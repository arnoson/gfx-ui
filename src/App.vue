<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import BitmapProperties from './components/BitmapProperties.vue'
import FrameEditor from './components/FrameEditor.vue'
import LayersTree from './components/LayersTree.vue'
import ToolBar from './components/ToolBar.vue'
import { useFrames } from './stores/frames'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { computed } from 'vue'
import ItemProperties from './components/ItemProperties.vue'
import FrameProperties from './components/FrameProperties.vue'
import SelectionProperties from './components/SelectionProperties.vue'

const frames = useFrames()
const frameId = frames.addFrame()
frames.activateFrame(frameId)

const { width } = useWindowSize()
const sidebarDefaultSize = computed(() => (200 / width.value) * 100)
const sidebarMinSize = computed(() => (175 / width.value) * 100)

frames.addItem(frameId, {
  type: 'line',
  from: { x: 0, y: 0 },
  to: { x: 10, y: 10 },
  color: 15,
})

frames.addItem(frameId, {
  type: 'rect',
  position: { x: 10, y: 10 },
  size: { width: 20, height: 8 },
  color: 15,
  isFilled: true,
})

frames.addItem(frameId, {
  type: 'circle',
  center: { x: 30, y: 30 },
  radius: 5,
  color: 15,
  isFilled: false,
})
</script>

<template>
  <SplitterGroup direction="horizontal">
    <SplitterPanel
      class="layers-panel"
      :default-size="sidebarDefaultSize"
      :min-size="sidebarMinSize"
    >
      <LayersTree />
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel class="editor-panel">
      <FrameEditor v-if="frames.activeFrame" :frame="frames.activeFrame" />
      <ToolBar />
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel
      class="properties-panel"
      :default-size="sidebarDefaultSize"
      :min-size="sidebarMinSize"
    >
      <ItemProperties v-if="frames.focusedItem" :item="frames.focusedItem" />
      <SelectionProperties
        v-else-if="frames.selectedItems"
        :items="frames.selectedItems"
      />
      <FrameProperties
        v-else-if="frames.activeFrame"
        :frame="frames.activeFrame"
      />
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
