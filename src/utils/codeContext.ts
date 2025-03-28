import type { CodeContext } from '~/types'

export const createCodeContext = (
  data: Omit<CodeContext, 'getUniqueName'>,
): CodeContext => {
  let nameCount: Record<string, number> = {}
  const getUniqueName = (name: string) => {
    nameCount[name] ??= 0
    if (nameCount[name] > 0) name += `_${nameCount[name]}`
    return name
  }

  return { ...data, getUniqueName }
}
