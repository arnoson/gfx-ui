import {
  useElementBounding,
  useEventListener,
  useMagicKeys,
} from '@vueuse/core'
import { computed, ref, type Ref } from 'vue'
import type { Size } from '~/types'

export const useZoomPan = (
  el: Ref<HTMLElement | null>,
  { size, scale }: { size: Ref<Size>; scale: Ref<number> },
) => {
  const { space } = useMagicKeys()
  let isPanning = ref(false)
  const panStartPoint = { x: 0, y: 0 }
  const scrollStart = { x: 0, y: 0 }

  const bounds = useElementBounding(el)

  useEventListener(
    'wheel',
    (e) => {
      if (!el.value) return
      if (!e.ctrlKey) return
      e.preventDefault()

      const left = bounds.left.value
      const top = bounds.top.value
      const mouseX = e.clientX - left + el.value.scrollLeft
      const mouseY = e.clientY - top + el.value.scrollTop

      const zoomFactor = 1.1
      const delta = e.deltaY < 0 ? zoomFactor : 1 / zoomFactor
      const newScale = Math.min(Math.max(scale.value * delta, 2), 20)

      // Adjust scroll to keep zoom position under cursor.
      const scaleRatio = newScale / scale.value
      el.value.scrollLeft = mouseX * scaleRatio - (e.clientX - left)
      el.value.scrollTop = mouseY * scaleRatio - (e.clientY - top)

      scale.value = newScale
    },
    { passive: false },
  )

  const scrolling = computed(() => {
    if (!el.value) return

    const width = bounds.width.value
    const height = bounds.height.value
    const isScrollingX = size.value.width * scale.value > width
    const isScrollingY = size.value.height * scale.value > height

    if (isScrollingX && isScrollingY) return 'both'
    if (isScrollingX) return 'x'
    if (isScrollingY) return 'y'
    return 'none'
  })

  useEventListener('mousedown', (e) => {
    if (!space.value) return
    if (!el.value) return

    isPanning.value = true
    panStartPoint.x = e.clientX
    panStartPoint.y = e.clientY
    scrollStart.x = el.value.scrollLeft
    scrollStart.y = el.value.scrollTop
  })

  useEventListener('mousemove', (e) => {
    if (!isPanning.value) return
    if (!space.value) return
    if (!el.value) return

    const deltaX = (e.clientX - panStartPoint.x) * -1
    const deltaY = (e.clientY - panStartPoint.y) * -1

    el.value.scrollLeft = scrollStart.x + deltaX
    el.value.scrollTop = scrollStart.y + deltaY
  })

  useEventListener('mouseup', () => (isPanning.value = false))

  return { isPanning, scrolling }
}
