export const createRegex = (...parts: RegExp[]) =>
  new RegExp(parts.map((v) => v.source).join(''))

// The meta info like `ItemName (locked, hidden)`
export const metaRegex = /(?<name>\w+)? *(?:\((?<settings>.*?)\))?/

export const commentRegex = /(?:\/\/ )?/
