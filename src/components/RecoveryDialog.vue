<script setup lang="ts">
import { ModalDialog } from 'tool-toolkit'
import { ref } from 'vue'

const dialog = ref<InstanceType<typeof ModalDialog> | null>(null)

defineExpose({
  prompt: () => dialog.value?.prompt(),
})
</script>

<template>
  <ModalDialog ref="dialog">
    <form method="dialog" class="flow">
      <h2>Restore previous session?</h2>
      <p>
        It looks like your last session wasn't saved. Would you like to restore
        it?
      </p>
      <menu>
        <button value="">Cancel</button>
        <button value="restore" autofocus>Restore</button>
      </menu>
    </form>
  </ModalDialog>
</template>
