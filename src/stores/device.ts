import { useStorage, useThrottleFn } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { onUnmounted, ref } from 'vue'
import { useProject } from './project'

export const useDevice = defineStore('device', () => {
  const project = useProject()

  let port: SerialPort | undefined
  let writer: WritableStreamDefaultWriter<Uint8Array> | undefined
  let isConnected = ref(false)
  let autoConnectIsSetup = false
  const lastDeviceInfo = useStorage<SerialPortInfo>('gfxui:last-device-info', {
    usbVendorId: undefined,
    usbProductId: undefined,
  })

  const setupPort = async (port: SerialPort) => {
    await port.open({ baudRate: 9600 })
    writer = port.writable?.getWriter()
    isConnected.value = true
    lastDeviceInfo.value = port.getInfo()
    console.log('setup', port.getInfo())
  }

  const isMatchingPort = (port: SerialPort) => {
    const { usbVendorId, usbProductId } = lastDeviceInfo.value
    const info = port.getInfo()
    return (
      usbVendorId === info.usbVendorId && usbProductId === info.usbProductId
    )
  }

  const connect = async () => {
    let port: SerialPort | undefined

    // Try to auto-connect to the last opened port.
    if (project.settings.rememberDevice) {
      const ports = await navigator.serial.getPorts()
      port = ports.find(isMatchingPort)
    }

    // This requires a user gesture (which might or might not have happened) we
    // try-catch it.
    try {
      port ??= await navigator.serial.requestPort()
    } catch (e) {}

    if (port) setupPort(port)

    // In case the port is unplugged and then plugged back in again, or if the
    // user hasn't plugged in the device yet, we will also listen for any new
    // connections.
    if (project.settings.rememberDevice && !autoConnectIsSetup) {
      navigator.serial.addEventListener('connect', (event) => {
        const newPort = event.target as SerialPort
        if (!isMatchingPort(newPort)) return
        port = newPort
        setupPort(port)
      })
      autoConnectIsSetup = true
    }
  }

  const disconnect = async () => {
    writer?.releaseLock()
    await port?.close()
    writer = undefined
    port = undefined
    isConnected.value = false
  }

  const sendScreenBuffer = useThrottleFn(
    async (bytes: Uint8Array) => writer?.write(bytes),
    1000 / 12,
    true,
  )

  onUnmounted(() => disconnect())

  return {
    isConnected,
    connect,
    disconnect,
    sendFrameBuffer: sendScreenBuffer,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useDevice, import.meta.hot))
