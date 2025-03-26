<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { codeToHtml } from 'shiki'
import { ref } from 'vue'
import { toCode as frameToCode } from '~/frame'
import { itemToCode, type Item } from '~/items/item'
import { useEditor, type Frame } from '~/stores/editor'

const props = defineProps<{ source: Item[] | Item | Frame }>()
const editor = useEditor()
const codeHtml = ref('')

watchDebounced(
  [() => props.source],
  async () => {
    let code = ''
    if (Array.isArray(props.source)) {
      code = props.source.map((v) => itemToCode(v, (name) => name)).join('\n')
    } else if (props.source.type === 'frame') {
      code = frameToCode(props.source, (name) => name)
    } else {
      code = itemToCode(props.source, (name) => name)
    }

    const html = await codeToHtml(code, {
      lang: 'cpp',
      theme: 'github-dark-default',
    })

    codeHtml.value = html
  },
  {
    debounce: 300,
    deep: true,
    immediate: editor.viewCode,
  },
)
</script>

<template>
  <div v-html="codeHtml"></div>
</template>
