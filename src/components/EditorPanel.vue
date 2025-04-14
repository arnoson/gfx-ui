<script setup lang="ts">
import { useActiveElement, useEventListener, useMagicKeys } from '@vueuse/core'
import { computed, useTemplateRef } from 'vue'
import { useZoomPan } from '~/composables/useZoomPan'
import type { Frame } from '~/frame'
import { useEditor } from '~/stores/editor'
import { mouseToSvg } from '~/utils/mouse'
import FrameCanvas from './FrameCanvas.vue'
import ItemBounds from './ItemBounds.vue'
import ItemControls from './ItemControls.vue'
import ItemHandle from './ItemHandle.vue'
import { useHistory } from '~/stores/history'

const props = defineProps<{ frame: Frame }>()
const editor = useEditor()
const history = useHistory()
const overlay = useTemplateRef('overlay')
const editorEl = useTemplateRef('editorEl')
const { space } = useMagicKeys()

const shouldIgnoreKeydown = () =>
  document.activeElement?.tagName === 'INPUT' ||
  document.activeElement?.tagName === 'TEXTAREA' ||
  document.activeElement?.hasAttribute('contenteditable')

const size = computed({
  get: () => props.frame.size,
  set: (value) => (props.frame.size = value),
})
const scale = computed({
  get: () => props.frame.scale,
  set: (value) => (props.frame.scale = value),
})
// Forward canvas mouse and key events to the active tool.
useEventListener<MouseEvent>(editorEl, 'mousedown', (e) => {
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
useEventListener('keydown', (e) => {
  if (shouldIgnoreKeydown()) return
  editor.activeTool.onKeyDown?.(e)
})

useEventListener('keydown', (e) => {
  if (shouldIgnoreKeydown()) return
  const target = e.target as HTMLElement

  if (e.code === 'Space' && target === document.body) e.preventDefault()

  if (!e.ctrlKey && !e.metaKey) {
    for (const tool of Object.values(editor.tools)) {
      if (e.key === tool.config?.shortcut) editor.activateTool(tool.id as any)
    }
    if (e.key === 'Escape') {
      editor.activateTool('select')
      editor.focusedItem = null
    }
  }

  if (e.key === 'z' && e.ctrlKey) {
    e.preventDefault()
    history.undo()
  }
  if (e.key === 'y' && e.ctrlKey) {
    e.preventDefault()
    history.redo()
  }
})

const { scrolling } = useZoomPan(editorEl, { size, scale })
</script>

<template>
  <div ref="editorEl" class="editor" :data-scrolling="scrolling">
    <div class="frame">
      <svg :viewBox="`0 0 ${size.width} ${size.height}`" class="overflow">
        <!-- Bounds for items outside of frame -->
        <ItemBounds
          v-for="item of frame.children"
          :key="item.id"
          :item="item"
          class="bounds"
        />
      </svg>
      <FrameCanvas class="canvas" :frame="frame" :key="frame.id" />
      <svg
        ref="overlay"
        :viewBox="`0 0 ${size.width} ${size.height}`"
        class="overlay"
        :style="`pointer-events: ${space ? 'none' : 'inital'}`"
      >
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
        <g v-if="!editor.isMoving">
          <ItemBounds
            v-for="item of editor.selectedItems"
            :key="item.id"
            :item="item"
            class="bounds"
          />
        </g>

        <!-- Handles -->
        <g v-if="editor.activeTool.id === 'select'">
          <template v-for="item of frame.children.toReversed()">
            <ItemHandle
              v-if="!editor.selectedItems.has(item)"
              :key="item.id"
              :item="item"
            />
          </template>
          <!-- Steal the pointer events from the handles that are below the
          selection. Pointer events for the selection are then handled in the
          select tool. -->
          <rect
            v-if="editor.selectedItemBounds"
            fill="transparent"
            :x="editor.selectedItemBounds.left"
            :y="editor.selectedItemBounds.top"
            :width="editor.selectedItemBounds.width"
            :height="editor.selectedItemBounds.height"
          />
        </g>

        <!-- Controls -->
        <ItemControls
          v-if="
            editor.activeTool.id === 'select' &&
            editor.focusedItem &&
            !editor.isMoving
          "
          :item="editor.focusedItem"
        />

        <!-- Selection rect -->
        <rect
          v-if="editor.isSelecting && editor.selectionBounds"
          class="selection"
          :x="editor.selectionBounds.left"
          :y="editor.selectionBounds.top"
          :width="editor.selectionBounds.width"
          :height="editor.selectionBounds.height"
        />
        <rect
          v-if="editor.selectedItemBounds && !editor.isMoving"
          class="bounds"
          :x="editor.selectedItemBounds.left"
          :y="editor.selectedItemBounds.top"
          :width="editor.selectedItemBounds.width"
          :height="editor.selectedItemBounds.height"
        />

        <!-- Snapping -->
        <g v-if="editor.snapGuides">
          <line
            v-if="editor.snapGuides.vertical"
            class="snap"
            :x1="editor.snapGuides.vertical.from.x"
            :y1="editor.snapGuides.vertical.from.y"
            :x2="editor.snapGuides.vertical.to.x"
            :y2="editor.snapGuides.vertical.to.y"
          />
          <line
            v-if="editor.snapGuides.horizontal"
            class="snap"
            :x1="editor.snapGuides.horizontal.from.x"
            :y1="editor.snapGuides.horizontal.from.y"
            :x2="editor.snapGuides.horizontal.to.x"
            :y2="editor.snapGuides.horizontal.to.y"
          />
        </g>
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

.canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  background-color: var(--color-background);
}

.overlay {
  position: absolute;
  display: block;
  inset: 0;
  overflow: visible;
}

.overflow {
  position: absolute;
  display: block;
  inset: 0;
  overflow: visible;
  z-index: -1;

  .bounds {
    stroke: var(--color-grid);
  }
}

.grid {
  --stroke-width: clamp(0.25, v-bind(scale) / 10, 1);
  fill: none;
  stroke: var(--color-grid);
  vector-effect: non-scaling-stroke;
  pointer-events: none;
  stroke-width: var(--stroke-width);
}

.snap {
  /* stroke: var(--color-accent); */
  stroke: seagreen;
  vector-effect: non-scaling-stroke;
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
