import { evaluateTree } from './helpers/evaluateTree'
import { type Condition, type EvaluateOptions } from './types'

export const evaluate: (expression: Condition | undefined, options?: EvaluateOptions) => boolean = evaluateTree
