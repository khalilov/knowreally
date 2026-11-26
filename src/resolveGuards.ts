import { createGuardResolver } from './helpers/createGuardResolver'
import { type Condition, type Guards } from './types'

export const resolveGuards = (expression: Condition, guards: Guards): Condition =>
  createGuardResolver(guards)(expression)
