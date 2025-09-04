<script setup lang="ts">
import { useEventListener, useWindowSize } from '@vueuse/core'
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'reka-ui'
import { computed } from 'vue'
import { LayersTree, ToolBar } from 'vue-toolkit'
import ComponentsPanel from './components/ComponentsPanel.vue'
import EditorPanel from './components/EditorPanel.vue'
import FramesPanel from './components/FramesPanel.vue'
import ProjectProperties from './components/ProjectProperties.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import { useDevice } from './stores/device'
import { useEditor } from './stores/editor'
import { useProject } from './stores/project'
import { useStorage } from './stores/storage'

import CircleIcon from '~/assets/icons/icon-layer-circle.svg'
import DrawIcon from '~/assets/icons/icon-layer-draw.svg'
import GroupIcon from '~/assets/icons/icon-layer-group.svg'
import InstanceIcon from '~/assets/icons/icon-layer-instance.svg'
import LineIcon from '~/assets/icons/icon-layer-line.svg'
import PolygonIcon from '~/assets/icons/icon-layer-polygon.svg'
import RectIcon from '~/assets/icons/icon-layer-rect.svg'
import TextIcon from '~/assets/icons/icon-layer-text.svg'

const editor = useEditor()
const project = useProject()
const device = useDevice()
const storage = useStorage()

const { width } = useWindowSize()
const sidebarDefaultSize = computed(() => (200 / width.value) * 100)
const sidebarMinSize = computed(() => (175 / width.value) * 100)

if (import.meta.hot) {
  project.clear()
}

storage.restoreBackup()
if (project.settings.rememberDevice) device.connect()

if (!import.meta.hot) {
  useEventListener(window, 'beforeunload', (e) => {
    if (storage.hasUnsavedChanges) e.preventDefault()
  })
}

const layerIcons = {
  bitmap: DrawIcon,
  circle: CircleIcon,
  line: LineIcon,
  rect: RectIcon,
  text: TextIcon,
  instance: InstanceIcon,
  group: GroupIcon,
  polygon: PolygonIcon,
}
</script>

<template>
  <SplitterGroup direction="horizontal" auto-save-id="main">
    <SplitterPanel
      :default-size="sidebarDefaultSize"
      :min-size="sidebarMinSize"
    >
      <ProjectProperties />
      <SplitterGroup direction="vertical" auto-save-id="sidebar-left">
        <SplitterPanel>
          <FramesPanel />
        </SplitterPanel>
        <SplitterResizeHandle />
        <SplitterPanel>
          <ComponentsPanel />
        </SplitterPanel>
      </SplitterGroup>
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel class="editor-panel">
      <EditorPanel v-if="editor.activeFrame" :frame="editor.activeFrame" />
      <ToolBar
        :tools="editor.tools"
        :selected="editor.activeToolId"
        @select="editor.activateTool($event)"
      />
    </SplitterPanel>
    <SplitterResizeHandle />
    <SplitterPanel
      :default-size="sidebarDefaultSize"
      :min-size="sidebarMinSize"
    >
      <SplitterGroup direction="vertical" auto-save-id="sidebar-right">
        <SplitterPanel class="properties-panel">
          <PropertiesPanel />
        </SplitterPanel>
        <SplitterResizeHandle />
        <SplitterPanel class="layers-panel">
          <LayersTree
            v-if="editor.activeFrame"
            :items="editor.activeFrame?.children"
            :selected-items="editor.selectedItems"
            :icons="layerIcons"
          />
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

.properties-panel {
  padding: var(--size-4);
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
