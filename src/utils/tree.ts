export type TreeItem = {
  id: number
  children?: TreeItem[]
}

export const findInTree = <T extends TreeItem>(
  items: T[],
  id: number,
): T | null => {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children?.length) {
      const result = findInTree(item.children, id)
      if (result) return result as T
    }
  }
  return null
}

export const getMaxTreeId = <T extends TreeItem>(item: T): number => {
  if (!item) return 0

  let maxId = item.id
  for (const child of item.children ?? []) {
    const id = getMaxTreeId(child)
    if (id > maxId) maxId = id
  }

  return maxId
}

export const removeFromTree = <T extends TreeItem>(
  items: T[],
  id: number,
): T | null => {
  const index = items.findIndex((v) => v.id === id)
  if (index !== -1) {
    const removedItem = items[index]
    items.splice(index, 1)
    return removedItem
  }

  for (const item of items) {
    if (!item.children?.length) continue
    const removedItem = removeFromTree(item.children, id)
    if (removedItem) return removedItem as T
  }

  return null
}

export const insertIntoTreeBefore = <T extends TreeItem>(
  items: T[],
  targetId: number,
  newItem: T,
): boolean => {
  const index = items.findIndex((v) => v.id === targetId)
  if (index !== -1) {
    items.splice(index, 0, newItem)
    return true
  }

  for (const item of items) {
    if (!item.children) continue
    if (insertIntoTreeBefore(item.children, targetId, newItem)) return true
  }

  return false
}

export const insertIntoTreeAfter = <T extends TreeItem>(
  items: T[],
  targetId: number,
  newItem: T,
): boolean => {
  const index = items.findIndex((v) => v.id === targetId)
  if (index !== -1) {
    items.splice(index + 1, 0, newItem)
    return true
  }

  for (const item of items) {
    if (!item.children) continue
    if (insertIntoTreeAfter(item.children, targetId, newItem)) return true
  }

  return false
}
