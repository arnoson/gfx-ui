export const sanitizeIdentifier = (name: string): string => {
  // Replace spaces with underscores and remove invalid characters.
  let sanitized = name.replace(/\s+/g, '_')
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '')

  // Ensure the name doesn't start with a digit.
  if (/^\d/.test(sanitized)) sanitized = '_' + sanitized

  return sanitized
}
