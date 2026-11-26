import { toNumber } from './helpers/toNumber'

export const lte = (left: unknown, right: unknown): boolean => toNumber(left) <= toNumber(right)
