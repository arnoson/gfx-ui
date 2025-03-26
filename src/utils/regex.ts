export const composeRegex = (...parts: RegExp[]) =>
  new RegExp(parts.map((v) => v.source).join(''))

// The meta info like `ItemName (locked, hidden)`
export const metaRegex = /(?<name>\w+(?: +\w+)*)? *(?:\((?<settings>.*?)\))?/

export const commentRegex = /(?:\/\/ )?/
