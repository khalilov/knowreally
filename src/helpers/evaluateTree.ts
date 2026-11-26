import { logicalConditions } from './logicalConditions'
import { getBuiltinCondition } from './getBuiltinCondition'
import { type Condition, type EvaluateOptions, type Guards } from '../types'

export const evaluateTree = (
  expression: Condition | undefined,
  { conditions = {}, resolve = (value) => value, test }: EvaluateOptions = {},
  guards?: Guards
): boolean => {
  const check = (node: unknown): boolean => {
    if (node === undefined) {
      return true
    }
    if (typeof node === 'boolean') {
      return node
    }
    if (Array.isArray(node) && typeof node[0] === 'string') {
      const [operator, ...args] = node

      if (Object.hasOwn(logicalConditions, operator)) {
        return logicalConditions[operator](args, check)
      } else if (operator === 'guard' && guards !== undefined) {
        const [name] = args

        if (args.length === 1 && typeof name === 'string') {
          if (Object.hasOwn(guards, name)) {
            return check(guards[name])
          }

          throw new TypeError(`Guard "${name}" is not defined`)
        }

        throw new TypeError('guard requires exactly one string name')
      } else {
        const builtin = getBuiltinCondition(operator, args.length)

        if (test !== undefined) {
          return test(operator, args)
        } else {
          const condition = builtin ?? (Object.hasOwn(conditions, operator) ? conditions[operator] : undefined)

          if (condition !== undefined) {
            return condition(...args.map((value, index) => resolve(value, operator, index)))
          }

          throw new TypeError(`Unknown condition "${operator}"`)
        }
      }
    }

    throw new TypeError('Expected a boolean or a condition array')
  }

  return check(expression)
}
