<script setup lang="ts">
import FrameEditor from './components/FrameEditor.vue'
import LayersTree from './components/LayersTree.vue'
import ToolBar from './components/ToolBar.vue'
import { useFrames } from './stores/frames'

const frames = useFrames()
const frameId = frames.addFrame()
frames.activateFrame(frameId)

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

frames.addItem(frameId, {
  type: 'bitmap',
  pixels: new Set(),
  color: 15,
})
</script>

<template>
  <FrameEditor v-if="frames.activeFrame" :frame="frames.activeFrame" />
  <ToolBar />
  <LayersTree />
</template>

<style scoped></style>
