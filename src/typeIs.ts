export const typeIs = (value: unknown, expected: unknown): boolean => {
  if (expected === 'finite-number') {
    return typeof value === 'number' && Number.isFinite(value)
  }
  if (expected === 'array') {
    return Array.isArray(value)
  }
  if (expected === 'record') {
    return value !== null && typeof value === 'object' && Array.isArray(value) === false
  }
  return expected === 'string' || expected === 'number' || expected === 'boolean' ? typeof value === expected : false
}
