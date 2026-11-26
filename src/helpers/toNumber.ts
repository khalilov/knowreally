import { toPrimitive } from './toPrimitive'

export const toNumber = (value: unknown): number => {
  const primitive = toPrimitive(value, 'number')

  if (
    typeof primitive !== 'symbol' &&
    typeof primitive !== 'function' &&
    (primitive === null || typeof primitive !== 'object')
  ) {
    return Number(primitive)
  }

  return NaN
}
