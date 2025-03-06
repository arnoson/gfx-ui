<script setup lang="ts">
import {
  useElementBounding,
  useEventListener,
  useMagicKeys,
} from '@vueuse/core'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRefs,
  useTemplateRef,
  watch,
  watchEffect,
} from 'vue'
import { drawBitmap } from '~/items/bitmap'
import { drawCircle } from '~/items/circle'
import { drawLine } from '~/items/line'
import { drawRect } from '~/items/rect'
import { useEditor } from '~/stores/editor'
import { useFrames, type Frame } from '~/stores/frames'
import { mouseToSvg } from '~/utils/mouse'
import BitmapControls from './BitmapControls.vue'
import CircleControls from './CircleControls.vue'
import LineControls from './LineControls.vue'
import RectControls from './RectControls.vue'

const props = defineProps<{ frame: Frame }>()

const { frame } = toRefs(props)
const { size, children: items, scale } = toRefs(props.frame)
const canvas = useTemplateRef('canvas')

const editor = useEditor()
const frames = useFrames()

let ctx = ref<CanvasRenderingContext2D | null>()
onMounted(() => (ctx.value = canvas.value?.getContext('2d') ?? null))

const blur = () => {
  if (editor.activeToolId === 'select') frames.blur()
}

const render = () => {
  if (!ctx.value) return
  ctx.value.clearRect(0, 0, size.value.width, size.value.height)
  for (const item of items.value) {
    if (item.type === 'line') drawLine(ctx.value, item)
    else if (item.type === 'rect') drawRect(ctx.value, item)
    else if (item.type === 'circle') drawCircle(ctx.value, item)
    else if (item.type === 'bitmap') drawBitmap(ctx.value, item)
  }
}
watchEffect(render)
watch(size, async () => {
  // Resizing the canvas will clear it, so we have to render again.
  await nextTick()
  render()
})

const overlay = useTemplateRef('overlay')
const background = useTemplateRef('background')
const editorEl = useTemplateRef('editorEl')
// Forward canvas mouse and key events to the active tool.
useEventListener<MouseEvent>(background, 'mousedown', (e) => {
  if (space.value) return
  const { onMouseDown, config } = editor.activeTool
  onMouseDown?.(mouseToSvg(e, overlay.value!, config?.pointRounding))
})
useEventListener('mousemove', (e) => {
  if (space.value) return
  const { onMouseMove, config } = editor.activeTool
  onMouseMove?.(mouseToSvg(e, overlay.value!, config?.pointRounding))
})
useEventListener('mouseup', (e) => {
  if (space.value) return
  const { onMouseUp, config } = editor.activeTool
  onMouseUp?.(mouseToSvg(e, overlay.value!, config?.pointRounding))
})
useEventListener('keydown', (e) => editor.activeTool.onKeyDown?.(e))

const editorBounds = useElementBounding(editorEl)
useEventListener(
  'wheel',
  (e) => {
    if (!editorEl.value) return
    if (!e.ctrlKey) return
    e.preventDefault()

    const left = editorBounds.left.value
    const top = editorBounds.top.value
    const mouseX = e.clientX - left + editorEl.value.scrollLeft
    const mouseY = e.clientY - top + editorEl.value.scrollTop

    const zoomFactor = 1.1
    const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor
    const newScale = Math.min(Math.max(scale.value * delta, 2), 20)

    // Adjust scroll to keep zoom position under cursor.
    const scaleRatio = newScale / scale.value
    editorEl.value.scrollLeft = mouseX * scaleRatio - (e.clientX - left)
    editorEl.value.scrollTop = mouseY * scaleRatio - (e.clientY - top)

    scale.value = newScale
  },
  { passive: false },
)

const scrolling = computed(() => {
  if (!editorEl.value) return

  const width = editorBounds.width.value
  const height = editorBounds.height.value
  const isScrollingX = size.value.width * scale.value > width
  const isScrollingY = size.value.height * scale.value > height

  if (isScrollingX && isScrollingY) return 'both'
  if (isScrollingX) return 'x'
  if (isScrollingY) return 'y'
  return 'none'
})

const { space } = useMagicKeys()
let isPanning = ref(false)
const panStartPoint = { x: 0, y: 0 }
const scrollStart = { x: 0, y: 0 }

useEventListener('mousedown', (e) => {
  if (!space.value) return
  if (!editorEl.value) return

  isPanning.value = true
  panStartPoint.x = e.clientX
  panStartPoint.y = e.clientY
  scrollStart.x = editorEl.value.scrollLeft
  scrollStart.y = editorEl.value.scrollTop
})

useEventListener('mousemove', (e) => {
  if (!isPanning.value) return
  if (!space.value) return
  if (!editorEl.value) return

  const deltaX = (e.clientX - panStartPoint.x) * -1
  const deltaY = (e.clientY - panStartPoint.y) * -1

  editorEl.value.scrollLeft = scrollStart.x + deltaX
  editorEl.value.scrollTop = scrollStart.y + deltaY
})

useEventListener('mouseup', () => (isPanning.value = false))

useEventListener('keydown', (e) => {
  if (e.code === 'Space') e.preventDefault()
})
</script>

<template>
  <div ref="editorEl" class="editor" :data-scrolling="scrolling">
    <div ref="frameEl" class="frame">
      <canvas
        ref="canvas"
        class="canvas"
        :width="size.width"
        :height="size.height"
      ></canvas>
      <svg
        ref="overlay"
        :viewBox="`0 0 ${size.width} ${size.height}`"
        class="overlay"
        :style="`pointer-events: ${space ? 'none' : 'inital'}`"
      >
        <!-- Background -->
        <rect ref="background" class="background" @mouseup="blur()" />

        <!-- Grid -->
        <g>
          <rect
            :x="0"
            :y="0"
            :width="size.width"
            :height="size.height"
            class="grid"
            :style="`--stroke-width: 1`"
          />
          <line
            v-for="row in size.height - 1"
            :x1="0"
            :y1="row"
            :x2="size.width"
            :y2="row"
            class="grid"
          />
          <line
            v-for="column in size.width - 1"
            :x1="column"
            :y1="0"
            :x2="column"
            :y2="size.height"
            class="grid"
          />
        </g>

        <!-- Bounds -->
        <g>
          <rect
            v-for="item of frames.selectedItems"
            :key="item.id"
            class="bounds"
            :x="item.bounds.left"
            :y="item.bounds.top"
            :width="item.bounds.width"
            :height="item.bounds.height"
          />
          <rect
            v-if="frames.focusedItem"
            :key="frames.focusedItem.id"
            class="bounds"
            :x="frames.focusedItem.bounds.left"
            :y="frames.focusedItem.bounds.top"
            :width="frames.focusedItem.bounds.width"
            :height="frames.focusedItem.bounds.height"
          />
        </g>

        <!-- Controls -->
        <g v-if="editor.activeToolId === 'select' && !frames.selectedItems">
          <template v-for="item of items" :key="item.id">
            <LineControls
              v-if="item.type === 'line'"
              :item="item"
              :frame="frame"
            />
            <RectControls
              v-else-if="item.type === 'rect'"
              :item="item"
              :frame="frame"
            />
            <CircleControls
              v-else-if="item.type === 'circle'"
              :item="item"
              :frame="frame"
            />
            <BitmapControls
              v-else-if="item.type === 'bitmap'"
              :item="item"
              :frame="frame"
            />
          </template>
        </g>

        <!-- Selection rect -->
        <rect
          v-if="frames.isSelecting && frames.selectionBounds"
          class="selection"
          :x="frames.selectionBounds.left"
          :y="frames.selectionBounds.top"
          :width="frames.selectionBounds.width"
          :height="frames.selectionBounds.height"
        />
        <rect
          v-if="frames.selectedItemBounds"
          class="bounds"
          :x="frames.selectedItemBounds.left"
          :y="frames.selectedItemBounds.top"
          :width="frames.selectedItemBounds.width"
          :height="frames.selectedItemBounds.height"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.editor {
  position: relative;
  overflow: auto;
  height: 100%;
}

.frame {
  position: relative;
  width: calc(v-bind('size.width') * v-bind(scale) * 1px);
  height: calc(v-bind('size.height') * v-bind(scale) * 1px);
  background-color: var(--color-background);

  [data-scrolling='y'] & {
    left: 50%;
    transform: translateX(-50%);
  }

  [data-scrolling='x'] & {
    top: 50%;
    transform: translateY(-50%);
  }

  [data-scrolling='none'] & {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.background {
  fill: transparent;
  width: 100vw;
  height: 100vh;
  translate: -50% -50%;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

.overlay {
  position: absolute;
  display: block;
  inset: 0;
  overflow: visible;
}

.grid {
  --stroke-width: clamp(0.25, v-bind(scale) / 10, 1);
  fill: none;
  stroke: var(--color-grid);
  vector-effect: non-scaling-stroke;
  pointer-events: none;
  stroke-width: var(--stroke-width);
}
</style>

<style>
.bounds {
  fill: none;
  stroke-width: 1;
  stroke: var(--color-bounds);
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}

.selection {
  fill: none;
  stroke-width: 1;
  stroke: var(--color-guide);
  stroke-dasharray: 2;
  vector-effect: non-scaling-stroke;
  pointer-events: none;
}

.point-handle {
  fill: transparent;
  r: calc(7 / v-bind(scale));
  cursor: default;
  stroke: var(--color-bounds);
  vector-effect: non-scaling-stroke;
}
</style>
