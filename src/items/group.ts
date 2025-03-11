import type { Bounds } from '~/types'
import { emptyBounds } from '~/utils/bounds'
import type { Item } from './item'

export interface Group {
  type: 'group'
  id: number
  children: Item[]
  bounds: Bounds
}

// TODO: implement
const move = (group: Group) => {}
const translate = (group: Group) => {}
const getBounds = (group: Group) => emptyBounds

export default { translate, move, getBounds }
