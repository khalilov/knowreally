import { toNumber } from './helpers/toNumber'

export const gte = (left: unknown, right: unknown): boolean => toNumber(left) >= toNumber(right)
