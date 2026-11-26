export const toPrimitive = (value: unknown, hint: 'number' | 'string'): unknown => {
  if ((typeof value === 'object' && value !== null) || typeof value === 'function') {
    const convert: unknown = Reflect.get(value, Symbol.toPrimitive)
    const methods = hint === 'number' ? (['valueOf', 'toString'] as const) : (['toString', 'valueOf'] as const)

    if (typeof convert === 'function') {
      return Reflect.apply(convert, value, [hint])
    }
    if (convert === undefined || convert === null) {
      for (const name of methods) {
        const method: unknown = Reflect.get(value, name)

        if (typeof method === 'function') {
          const result: unknown = Reflect.apply(method, value, [])

          if (Object(result) !== result) {
            return result
          }
        }
      }
    }
  }

  return value
}
