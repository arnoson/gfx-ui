export const mouseToSvg = (
  e: MouseEvent,
  el: SVGSVGElement | SVGGraphicsElement,
  roundingMethod?: 'floor' | 'ceil' | 'round',
) => {
  const svg = el instanceof SVGSVGElement ? el : el.ownerSVGElement!
  const point = svg.createSVGPoint()
  point.x = e.clientX
  point.y = e.clientY

  const ctm = el.getScreenCTM()!.inverse()
  const svgSpacePoint = point.matrixTransform(ctm)

  const round = roundingMethod && Math[roundingMethod]
  if (round) {
    svgSpacePoint.x = round(svgSpacePoint.x)
    svgSpacePoint.y = round(svgSpacePoint.y)
  }
  return { x: svgSpacePoint.x, y: svgSpacePoint.y }
}
