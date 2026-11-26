import { sizeOf } from './helpers/sizeOf'

export const notEmpty = (value: unknown): boolean => sizeOf(value) > 0
