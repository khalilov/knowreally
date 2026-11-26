import { canConvertToPrimitive } from './helpers/canConvertToPrimitive'

export const includes = (collection: unknown, value: unknown): boolean => {
  if (typeof collection === 'string') {
    return canConvertToPrimitive(value) && collection.includes(String(value))
  }
  if (Array.isArray(collection)) {
    return collection.includes(value)
  }
  if (collection instanceof Set) {
    return collection.has(value)
  }
  return false
}
