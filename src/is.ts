import { pick } from 'objwalk'
import { evaluateTree } from './helpers/evaluateTree'
import { registeredGuards } from './guard'
import { type Condition } from './types'

export const is = (data: unknown, condition: Condition | undefined): boolean =>
  evaluateTree(
    condition,
    {
      resolve: (value, _operator, operand) => {
        if (typeof value === 'string') {
          if (value === '$data') {
            return data
          }
          if (operand === 0 || value.startsWith('$data.')) {
            const path = value.startsWith('$data.') ? value.slice(6) : value

            return data !== null && typeof data === 'object' ? pick(data as Record<string, unknown>, path) : undefined
          }
        }

        return value
      },
    },
    registeredGuards
  )
