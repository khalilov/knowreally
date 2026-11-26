import { toNumber } from './helpers/toNumber'

export const gt = (left: unknown, right: unknown): boolean => toNumber(left) > toNumber(right)
