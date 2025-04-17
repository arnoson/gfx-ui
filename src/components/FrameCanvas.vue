<script setup lang="ts">
import {
  nextTick,
  onMounted,
  ref,
  toRefs,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue'
import { drawItem, type DrawContext } from '~/items/item'
import type { Frame } from '~/frame'
import { polygon } from '~/items/polygon'
import { useEditor } from '~/stores/editor'

const props = defineProps<{ frame: Frame }>()
const { size, children } = toRefs(props.frame)
const editor = useEditor()

let ctx = ref<CanvasRenderingContext2D | null>()
const canvas = useTemplateRef('canvas')
onMounted(() => (ctx.value = canvas.value?.getContext('2d') ?? null))

const drawCtx: DrawContext = {
  drawPixel(x, y, color) {
    if (!ctx.value) return
    ctx.value.fillStyle = editor.pixelColors[color]
    ctx.value.fillRect(Math.floor(x), Math.floor(y), 1, 1)
  },
}

const render = () => {
  if (!ctx.value) return
  ctx.value.clearRect(0, 0, size.value.width, size.value.height)
  for (const item of children.value.toReversed()) drawItem(drawCtx, item)
}
watchEffect(render)
watch(size, async () => {
  // Resizing the canvas will clear it, so we have to render again.
  await nextTick()
  render()
})
</script>

<template>
  <canvas
    :width="frame.size.width"
    :height="frame.size.height"
    ref="canvas"
  ></canvas>
</template>

<style scoped>
canvas {
  display: block;
  image-rendering: pixelated;
}
</style>
