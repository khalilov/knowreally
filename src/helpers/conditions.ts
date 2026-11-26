import { eq } from '../eq'
import { neq } from '../neq'
import { gt } from '../gt'
import { gte } from '../gte'
import { lt } from '../lt'
import { lte } from '../lte'
import { truthy } from '../truthy'
import { falsy } from '../falsy'
import { exists } from '../exists'
import { missing } from '../missing'
import { empty } from '../empty'
import { notEmpty } from '../notEmpty'
import { includes } from '../includes'
import { contains } from '../contains'
import { typeIs } from '../typeIs'
import { changed } from '../changed'
import { cooldownReady } from '../cooldownReady'

type BuiltinCondition = {
  test: (...args: unknown[]) => boolean
  arity: number
  maxArity?: number
}

export const conditions: Readonly<Record<string, BuiltinCondition>> = {
  eq: { test: eq, arity: 2 },
  neq: { test: neq, arity: 2 },
  gt: { test: gt, arity: 2 },
  gte: { test: gte, arity: 2 },
  lt: { test: lt, arity: 2 },
  lte: { test: lte, arity: 2 },
  truthy: { test: truthy, arity: 1 },
  falsy: { test: falsy, arity: 1 },
  exists: { test: exists, arity: 1 },
  missing: { test: missing, arity: 1 },
  empty: { test: empty, arity: 1 },
  notEmpty: { test: notEmpty, arity: 1 },
  includes: { test: includes, arity: 2 },
  contains: { test: contains, arity: 2 },
  typeIs: { test: typeIs, arity: 2 },
  changed: { test: changed, arity: 2 },
  cooldownReady: { test: cooldownReady, arity: 2, maxArity: 3 },
}
