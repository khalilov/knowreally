import { logicalConditions } from './logicalConditions'
import { type Condition, type Guards } from '../types'

export const createGuardResolver = (guards: Guards, validate?: (operator: string, arity: number) => void) => {
  const resolvedGuards = new Map<string, Condition>()
  const active = new Set<string>()
  const expand = (node: unknown, path: readonly number[] = []): Condition => {
    if (typeof node === 'boolean') {
      return node
    }
    if (Array.isArray(node) && typeof node[0] === 'string') {
      const [operator, ...args] = node

      if (operator === 'guard') {
        const [name] = args

        if (args.length === 1 && typeof name === 'string') {
          const cached = resolvedGuards.get(name)

          if (cached !== undefined) {
            return cached
          }
          if (active.has(name)) {
            throw Object.assign(new TypeError(`Guard "${name}" is part of a reference cycle`), {
              code: 'GUARD_CYCLE',
              guard: name,
              path,
            })
          }
          if (Object.hasOwn(guards, name)) {
            active.add(name)
            try {
              const resolved = expand(guards[name], path)

              resolvedGuards.set(name, resolved)
              return resolved
            } finally {
              active.delete(name)
            }
          }

          throw Object.assign(new TypeError(`Guard "${name}" is not defined`), {
            code: 'GUARD_NOT_FOUND',
            guard: name,
            path,
          })
        }

        throw new TypeError('guard requires exactly one string name')
      }
      if (Object.hasOwn(logicalConditions, operator)) {
        if (operator === 'not' && args.length !== 1) {
          throw new TypeError('not requires exactly one condition')
        }

        return [
          operator,
          ...args.map((child, index) => (child === undefined ? undefined : expand(child, [...path, index + 1]))),
        ]
      }

      validate?.(operator, args.length)
      return [operator, ...args]
    }

    throw new TypeError('Expected a boolean or a condition array')
  }

  return expand
}
