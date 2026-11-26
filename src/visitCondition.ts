import { each } from 'objwalk'
import { logicalConditions } from './helpers/logicalConditions'

export const visitCondition = (
  expression: unknown,
  visit: (node: unknown, path: readonly number[], kind: 'leaf' | 'logical' | 'invalid-logical') => void
): void => {
  const walk = (node: unknown, path: readonly number[]): void => {
    if (Array.isArray(node) && typeof node[0] === 'string' && Object.hasOwn(logicalConditions, node[0])) {
      const [operator, ...args] = node

      if (operator === 'not' && args.length !== 1) {
        visit(node, path, 'invalid-logical')
      } else {
        visit(node, path, 'logical')
        each(args, (index, child) => walk(child, [...path, index + 1]), { shallow: true })
      }
    } else {
      visit(node, path, 'leaf')
    }
  }

  walk(expression, [])
}
