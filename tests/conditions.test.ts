import { describe, expect, it } from 'vitest'
import {
  changed,
  contains,
  cooldownReady,
  empty,
  eq,
  evaluate,
  exists,
  falsy,
  gt,
  gte,
  includes,
  lt,
  lte,
  missing,
  neq,
  notEmpty,
  resolveGuards,
  truthy,
  typeIs,
} from '../src/index'

describe('built-in predicates', () => {
  it('preserves comparison and presence semantics from Slapflow', () => {
    expect(eq(NaN, NaN)).toBe(true)
    expect(neq(0, -0)).toBe(true)
    expect(changed(false, 0)).toBe(true)
    expect(gt('2', 1) && gte('2', 2) && lt(1, '2') && lte(2, '2')).toBe(true)
    expect(truthy([]) && falsy(0) && exists(false) && missing(null)).toBe(true)
    expect(empty(new Map()) && notEmpty(new Set([0]))).toBe(true)
    expect(typeIs([], 'record')).toBe(false)
    expect(typeIs(Infinity, 'finite-number')).toBe(false)
    expect(cooldownReady(100, undefined, 50)).toBe(true)
    expect(cooldownReady(100, 80, 50)).toBe(false)
  })

  it('distinguishes membership and own-field presence', () => {
    expect(includes([NaN], NaN)).toBe(true)
    expect(includes(new Set([0]), 0)).toBe(true)
    expect(includes('abc', 'bc')).toBe(true)
    expect(contains({ a: false, b: 0, c: '' }, ['a', 'b', 'c'])).toBe(true)
    expect(contains(Object.create({ a: true }), ['a'])).toBe(false)
    expect(contains({ a: null }, ['a'])).toBe(false)
    expect(contains({}, Array(1))).toBe(false)
    expect(contains({ a: 1 }, [])).toBe(true)
  })
})

describe('condition trees', () => {
  it('short-circuits before resolving later operands and supports custom conditions', () => {
    const resolve = (value: unknown) => {
      if (value === 'unreachable') {
        throw Error('should not resolve')
      }
      return value
    }

    expect(evaluate(['and', false, ['truthy', 'unreachable']], { resolve })).toBe(false)
    expect(evaluate(['or', true, ['truthy', 'unreachable']], { resolve })).toBe(true)
    expect(evaluate(['not', ['odd', 4]], { conditions: { odd: (value) => Number(value) % 2 === 1 } })).toBe(true)
  })

  it('expands nested guards and detects missing names and cycles', () => {
    const tree = resolveGuards(['and', ['guard', 'ready'], ['guard', 'ready']], {
      ready: ['not', ['guard', 'busy']],
      busy: false,
    })

    expect(evaluate(tree)).toBe(true)
    expect(() => resolveGuards(['or', true, ['guard', 'missing']], {})).toThrow('not defined')
    expect(() => resolveGuards(['guard', 'a'], { a: ['guard', 'b'], b: ['guard', 'a'] })).toThrow('cycle')
  })
})

describe('predicate input contracts', () => {
  it.each([
    [gt, 2, 1],
    [gte, 2, 2],
    [lt, 1, 2],
    [lte, 2, 2],
  ] as const)('checks numeric operands without throwing on unsupported values', (compare, left, right) => {
    expect(compare(String(left), right)).toBe(true)
    expect(compare(Symbol(), right)).toBe(false)
    expect(compare(left, Symbol())).toBe(false)
    expect(compare(Object.create(null), right)).toBe(false)
    expect(compare(left, Object.create(null))).toBe(false)
    expect(compare(NaN, right)).toBe(false)
    expect(compare(left, undefined)).toBe(false)
  })

  it('preserves compatible conversions, nullish defaults and reference equality', () => {
    expect(gt(1, null)).toBe(true)
    expect(gt(Infinity, 1)).toBe(true)
    expect(gt(new Date(10), 1)).toBe(true)
    expect(gt({ valueOf: () => 10 }, 1)).toBe(true)
    expect(includes('abc', Object.create(null))).toBe(false)
    expect(includes('Symbol(item)', Symbol('item'))).toBe(true)
    expect(includes(NaN, '213')).toBe(false)
    expect(cooldownReady(Symbol(), undefined, Symbol())).toBe(true)
    expect(cooldownReady(Symbol(), 1, 0)).toBe(false)
    expect(cooldownReady(3, Symbol(), 0)).toBe(false)
    expect(cooldownReady(3, 1, Symbol())).toBe(false)
    expect(cooldownReady(3, 1)).toBe(true)
    expect(changed).toBe(neq)
  })

  it('propagates exceptions from getters and user-supplied conversions', () => {
    const failure = new TypeError('user error')
    const target = {
      get value(): never {
        throw failure
      },
      valueOf(): never {
        throw failure
      },
      toString(): never {
        throw failure
      },
    }

    expect(() => gt(target, 1)).toThrow(failure)
    expect(() => includes('x', target)).toThrow(failure)
    expect(() => contains(target, ['value'])).toThrow(failure)
  })
})
