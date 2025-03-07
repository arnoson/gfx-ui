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

export const pixelColors = [
  'hsl(0, 0%, 0%)',
  'hsl(0, 0%, 6.67%)',
  'hsl(0, 0%, 13.33%)',
  'hsl(0, 0%, 20%)',
  'hsl(0, 0%, 26.67%)',
  'hsl(0, 0%, 33.33%)',
  'hsl(0, 0%, 40%)',
  'hsl(0, 0%, 46.67%)',
  'hsl(0, 0%, 53.33%)',
  'hsl(0, 0%, 60%)',
  'hsl(0, 0%, 66.67%)',
  'hsl(0, 0%, 73.33%)',
  'hsl(0, 0%, 80%)',
  'hsl(0, 0%, 86.67%)',
  'hsl(0, 0%, 93.33%)',
  'hsl(0, 0%, 100%)',
]

export const drawPixel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: Color,
) => {
  ctx.fillStyle = pixelColors[color]
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
}
