import { sizeOf } from './helpers/sizeOf'

export const empty = (value: unknown): boolean => sizeOf(value) === 0
