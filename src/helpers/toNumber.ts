import { canConvertToPrimitive } from './canConvertToPrimitive'

export const toNumber = (value: unknown): number =>
  typeof value === 'symbol' || canConvertToPrimitive(value) === false ? NaN : Number(value)
