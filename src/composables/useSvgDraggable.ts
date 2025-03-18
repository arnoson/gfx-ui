import { useEventListener } from '@vueuse/core'
import { ref, type Ref } from 'vue'
import type { Point } from '~/types'
import { mouseToSvg } from '~/utils/mouse'

interface UseDraggableSvgOptions {
  onMove: (position: Point, delta: Point) => void
  onEnd?: () => void
  isPoint?: boolean
}

export const useSvgDraggable = (
  el: Ref<SVGGraphicsElement | null>,
  { isPoint, onMove, onEnd }: UseDraggableSvgOptions,
) => {
  const isDragging = ref(false)
  let clickDelta = { x: 0, y: 0 }
  let lastRoundedPoint = { x: 0, y: 0 }

  const start = (e: MouseEvent) => {
    if (!el.value) return

    e.stopPropagation()

    const point = mouseToSvg(e, el.value)
    lastRoundedPoint = {
      x: Math.floor(point.x),
      y: Math.floor(point.y),
    }

    // If we are dragging a point, we don't want to use click delta, because
    // we want to allow precise mouse control over where the point is dragged.
    if (!isPoint) {
      const bounds = el.value.getBBox()
      clickDelta = {
        x: point.x - bounds.x,
        y: point.y - bounds.y,
      }
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', end)

    isDragging.value = true
    el.value.setAttribute('dragging', '')
    document.body.style.cursor = 'default'
  }

  const move = (e: MouseEvent) => {
    if (!isDragging.value) return
    if (!el.value) return

    e.stopPropagation()

    const point = mouseToSvg(e, el.value)
    const roundedPoint = {
      x: Math.floor(point.x),
      y: Math.floor(point.y),
    }

    const position = {
      x: Math.floor(point.x - clickDelta.x),
      y: Math.floor(point.y - clickDelta.y),
    }

    const delta = {
      x: roundedPoint.x - lastRoundedPoint.x,
      y: roundedPoint.y - lastRoundedPoint.y,
    }
    lastRoundedPoint = roundedPoint

    onMove(position, delta)
  }

  const end = (e: MouseEvent) => {
    e.stopPropagation()
    isDragging.value = false
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', end)

    el.value?.removeAttribute('dragging')
    document.body.style.cursor = ''
    onEnd?.()
  }

  useEventListener(el, 'mousedown', start)
}
