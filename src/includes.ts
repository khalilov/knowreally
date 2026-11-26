import { toPrimitive } from './helpers/toPrimitive'

export const includes = (collection: unknown, value: unknown): boolean => {
  if (typeof collection === 'string') {
    const primitive = toPrimitive(value, 'string')

    if (
      (typeof primitive !== 'object' || primitive === null) &&
      typeof primitive !== 'function' &&
      (typeof primitive !== 'symbol' || primitive === value)
    ) {
      return collection.includes(String(primitive))
    }
    return false
  }
  if (Array.isArray(collection)) {
    return collection.includes(value)
  }
  if (collection instanceof Set) {
    return collection.has(value)
  }
  return false
}
