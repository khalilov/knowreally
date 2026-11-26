import { conditions } from './conditions'

export const getBuiltinCondition = (operator: string, count: number): ((...args: unknown[]) => boolean) | undefined => {
  if (Object.hasOwn(conditions, operator)) {
    const { test, arity, maxArity = arity } = conditions[operator]

    if (count >= arity && count <= maxArity) {
      return test
    }

    const expected = maxArity === arity ? String(arity) : `${arity}–${maxArity}`

    throw new TypeError(`Condition "${operator}" expects ${expected} operand(s), received ${count}`)
  }
}
