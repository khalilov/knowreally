import { exists } from './exists'

export const contains = (target: unknown, fields: unknown): boolean => {
  if (target !== null && typeof target === 'object' && Array.isArray(target) === false && Array.isArray(fields)) {
    const names = [...fields]
    const record: Record<string, unknown> = target as Record<string, unknown>

    if (names.every((name): name is string => typeof name === 'string')) {
      return names.every((name) => Object.hasOwn(record, name) && exists(record[name]))
    }
  }

  return false
}
