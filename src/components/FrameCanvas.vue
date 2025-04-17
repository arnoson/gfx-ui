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
import { drawItem } from '~/items/item'
import type { Frame } from '~/frame'
import { polygon } from '~/items/polygon'

const props = defineProps<{ frame: Frame }>()
const { size, children } = toRefs(props.frame)
let ctx = ref<CanvasRenderingContext2D | null>()
const canvas = useTemplateRef('canvas')
onMounted(() => (ctx.value = canvas.value?.getContext('2d') ?? null))

const render = () => {
  if (!ctx.value) return
  ctx.value.clearRect(0, 0, size.value.width, size.value.height)
  for (const item of children.value.toReversed()) drawItem(ctx.value, item)
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
