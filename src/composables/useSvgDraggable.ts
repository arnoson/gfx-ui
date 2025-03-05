import { useEventListener } from '@vueuse/core'
import { ref, toValue, type MaybeRef, type Ref } from 'vue'
import type { Frame } from '~/stores/frames'
import type { Point } from '~/types'
import { mouseToSvg } from '~/utils/mouse'

interface UseDraggableSvgOptions {
  onMove: (position: Point) => void
  isPoint?: boolean
}

export const useSvgDraggable = (
  el: Ref<SVGGraphicsElement | null>,
  { isPoint, onMove }: UseDraggableSvgOptions,
) => {
  const isDragging = ref(false)
  const delta = ref({ x: 0, y: 0 })

  const start = (e: MouseEvent) => {
    if (!el.value) return

    const point = mouseToSvg(e, el.value)

    // If we are dragging a point, we don't want to use click delta, because
    // we want to allow precise mouse control over where the point is dragged.
    if (!isPoint) {
      const bounds = el.value.getBBox()
      delta.value = {
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

    const point = mouseToSvg(e, el.value)
    const x = Math.floor(point.x - delta.value.x)
    const y = Math.floor(point.y - delta.value.y)

    onMove({ x, y })
  }

  const end = () => {
    isDragging.value = false
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', end)

    el.value?.removeAttribute('dragging')
    document.body.style.cursor = ''
  }

  useEventListener(el, 'mousedown', start)
}
