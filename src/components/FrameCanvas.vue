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
import { useDevice } from '~/stores/device'
import type { Color } from '~/types'

const props = defineProps<{ frame: Frame; livePreview?: boolean }>()
const { size, children } = toRefs(props.frame)
const editor = useEditor()
const device = useDevice()

let ctx = ref<CanvasRenderingContext2D | null>()
const canvas = useTemplateRef('canvas')
onMounted(() => (ctx.value = canvas.value?.getContext('2d') ?? null))

const createFrameBuffer = () =>
  new Uint8Array(
    Math.ceil((device.displaySize.width * device.displaySize.height) / 2),
  )

const clearFrameBuffer = () => frameBuffer?.fill(0)

const setFrameBufferPixel = (x: number, y: number, color: Color) => {
  if (!frameBuffer) return

  const { width, height } = device.displaySize
  if (x < 0 || x >= width) return
  if (y < 0 || y >= height) return

  let pixelIndex = y * width + x
  let byteIndex = Math.floor(pixelIndex / 2)
  if (pixelIndex % 2 === 0) {
    frameBuffer[byteIndex] = (frameBuffer[byteIndex] & 0x0f) | (color << 4)
  } else {
    frameBuffer[byteIndex] = (frameBuffer[byteIndex] & 0xf0) | color
  }
}

let frameBuffer: Uint8Array | undefined
watch(
  () => props.livePreview,
  (value) => {
    frameBuffer = value ? createFrameBuffer() : undefined
  },
  { immediate: true },
)

const drawCtx: DrawContext = {
  drawPixel(x, y, color) {
    if (!ctx.value) return

    ctx.value.fillStyle = editor.colors[color].color
    ctx.value.fillRect(Math.floor(x), Math.floor(y), 1, 1)

    if (props.livePreview) setFrameBufferPixel(x, y, color)
  },
}

const render = () => {
  if (!ctx.value) return

  if (props.livePreview) clearFrameBuffer()

  ctx.value.clearRect(0, 0, size.value.width, size.value.height)
  for (const item of children.value.toReversed()) drawItem(drawCtx, item)

  if (props.livePreview && frameBuffer) device.sendFrameBuffer(frameBuffer)
}

watchEffect(render, { flush: 'post' })
watch(size, async () => {
  if (props.livePreview) frameBuffer = createFrameBuffer()
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
