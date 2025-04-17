import type { Color } from '~/types'

export const packPixel = (x: number, y: number) => {
  // Encode x and y with the sign bit in the MSB.
  const xPacked = ((x < 0 ? 0 : 1) << 15) | (Math.abs(x) & 0x7fff)
  const yPacked = ((y < 0 ? 0 : 1) << 15) | (Math.abs(y) & 0x7fff)
  // Combine into a single 32-bit number.
  return (xPacked << 16) | yPacked
}

export const unpackPixelX = (xy: number) => {
  const xPacked = (xy >> 16) & 0xffff
  // Extract the sign from the MSB and the value from the remaining 15 bits.
  const xSign = xPacked & 0x8000 ? 1 : -1
  const xValue = xPacked & 0x7fff
  return xSign * xValue
}

export const unpackPixelY = (xy: number) => {
  const yPacked = xy & 0xffff
  // Extract the sign from the MSB and the value from the remaining 15 bits.
  const ySign = yPacked & 0x8000 ? 1 : -1
  const yValue = yPacked & 0x7fff
  return ySign * yValue
}

export const unpackPixel = (xy: number) => ({
  x: unpackPixelX(xy),
  y: unpackPixelY(xy),
})
