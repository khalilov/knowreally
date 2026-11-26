export const canConvertToPrimitive = (value: unknown): boolean =>
  value === null ||
  typeof value !== 'object' ||
  Symbol.toPrimitive in value ||
  'valueOf' in value ||
  'toString' in value
