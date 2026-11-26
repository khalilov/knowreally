import { toNumber } from './helpers/toNumber'

export const lt = (left: unknown, right: unknown): boolean => toNumber(left) < toNumber(right)
