import { useStorage, useThrottleFn } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { onUnmounted, ref } from 'vue'
import { useProject } from './project'

export const useDevice = defineStore('device', () => {
  const project = useProject()

  const hasWebSerial = 'serial' in navigator
  let port: SerialPort | undefined
  let writer: WritableStreamDefaultWriter<Uint8Array> | undefined
  let isConnected = ref(false)
  let autoConnectIsSetup = false
  const lastDeviceInfo = useStorage<SerialPortInfo>('gfxui:last-device-info', {
    usbVendorId: undefined,
    usbProductId: undefined,
  })

  const openPort = async (port: SerialPort) => {
    await port.open({ baudRate: 9600 })
    writer = port?.writable?.getWriter()
    isConnected.value = true
    lastDeviceInfo.value = port.getInfo()
    writer?.write(new TextEncoder().encode('gfxui:live=1'))
  }

  const connect = async () => {
    // Try to auto-connect to the last opened port.
    if (project.settings.rememberDevice) {
      const ports = await navigator.serial.getPorts()
      port = ports.find(isMatchingPort)
    }

    // This requires a user gesture (which might or might not have happened) so
    // we have to try-catch it.
    try {
      port ??= await navigator.serial.requestPort()
    } catch (e) {}

    if (port) await openPort(port)

    if (project.settings.rememberDevice && !autoConnectIsSetup) {
      navigator.serial.addEventListener('connect', async (event) => {
        const newPort = event.target as SerialPort
        if (!isMatchingPort(newPort)) return
        await openPort(newPort)
      })
      autoConnectIsSetup = true
    }
  }

  const disconnect = async () => {
    writer?.write(new TextEncoder().encode('gfxui:live=0'))
    await writer?.close()
    await port?.close()
    isConnected.value = false
  }

  const isMatchingPort = (port: SerialPort) => {
    const { usbVendorId, usbProductId } = lastDeviceInfo.value
    const info = port.getInfo()
    return (
      usbVendorId === info.usbVendorId && usbProductId === info.usbProductId
    )
  }

  const sendScreenBuffer = useThrottleFn(
    async (bytes: Uint8Array) => {
      writer?.write(bytes)
    },
    1000 / 12,
    true,
  )

  onUnmounted(() => disconnect())

  return {
    hasWebSerial,
    isConnected,
    connect,
    disconnect,
    sendFrameBuffer: sendScreenBuffer,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDevice, import.meta.hot))
