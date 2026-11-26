import { map } from 'objwalk'
import { getBuiltinCondition } from './helpers/getBuiltinCondition'
import { createGuardResolver } from './helpers/createGuardResolver'
import { type Guards } from './types'

let definitions: Guards = {}
export let registeredGuards: Guards = {}

export const guard = (guards: Guards): void => {
  const next = { ...definitions, ...guards }
  const resolve = createGuardResolver(next, (operator, arity) => {
    if (getBuiltinCondition(operator, arity) === undefined) {
      throw new TypeError(`Unknown condition "${operator}"`)
    }
  })
  const expanded = map(next, (name) => resolve(['guard', name]), { shallow: true })

  definitions = next
  registeredGuards = expanded
}
