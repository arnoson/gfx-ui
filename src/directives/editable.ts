import type { Directive } from 'vue'

export const vEditable: Directive<HTMLElement> = {
  mounted(el) {
    el.addEventListener('click', () => {
      el.setAttribute('contenteditable', 'true')
      setTimeout(() => {
        if (document.activeElement !== el) {
          el.removeAttribute('contenteditable')
        }
      }, 300)
    })

    el.addEventListener('blur', () => el.removeAttribute('contenteditable'))
  },
}
