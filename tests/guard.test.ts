import { describe, expect, it } from 'vitest'
import { evaluate, guard, is, resolveGuards, visitCondition } from '../src/index'

describe('guard and is', () => {
  it('registers forward references and checks paths, types, and literal operands', () => {
    guard({
      'placement-ready': ['and', ['guard', 'placement-target'], ['exists', 'placement']],
      'placement-target': ['typeIs', 'gameObjectId', 'string'],
    })

    expect(is({ gameObjectId: 'unit', placement: {} }, ['guard', 'placement-ready'])).toBe(true)
    expect(is({ gameObjectId: 'unit' }, ['guard', 'placement-ready'])).toBe(false)
    expect(is({ queue: [{ id: 'op' }], literal: 'op' }, ['eq', 'queue[0].id', 'op'])).toBe(true)
    expect(is({ queue: [{ id: 'op' }], target: 'op' }, ['eq', 'queue[0].id', '$data.target'])).toBe(true)
    expect(is({ status: 'ready', ready: 'other' }, ['eq', 'status', 'ready'])).toBe(true)
    expect(is('unit', ['typeIs', '$data', 'string'])).toBe(true)
    expect(is(NaN, ['includes', '$data', '213'])).toBe(false)
  })

  it('updates dependent guards and leaves all registrations intact after a failed batch', () => {
    guard({ active: true, dependent: ['guard', 'active'] })
    expect(is({}, ['guard', 'dependent'])).toBe(true)

    guard({ active: false })
    expect(is({}, ['guard', 'dependent'])).toBe(false)

    expect(() => guard({ active: true, missing: ['guard', 'unknown'] })).toThrow('not defined')
    expect(() => guard({ active: ['guard', 'dependent'] })).toThrow('cycle')
    expect(() => guard({ active: ['or', true, ['unknown-operator']] })).toThrow('Unknown condition')
    expect(is({}, ['guard', 'dependent'])).toBe(false)
    expect(() => is({}, ['guard', 'missing'])).toThrow('not defined')
  })

  it('short-circuits at evaluation and keeps explicit guard sets available for Slapflow', () => {
    const data = {
      get unreachable(): never {
        throw Error('should not read this field')
      },
    }

    expect(is(data, ['or', true, ['truthy', 'unreachable']])).toBe(true)
    expect(is(data, ['not', ['or', false, false]])).toBe(true)
    expect(() => guard({ invalid: ['not', false, false] })).toThrow('exactly one')
    expect(
      evaluate(resolveGuards(['guard', 'local'], { local: ['custom', 'same'] }), {
        conditions: { custom: (value) => value === 'same' },
      })
    ).toBe(true)
  })
})

it('exposes leaf evaluation and structural visits without overriding short circuiting', () => {
  const seen: unknown[] = []
  const expression = ['and', ['or', true, ['custom', 'unreachable']], ['contains', { a: 1 }, ['a']]] as const
  const matched = evaluate(expression, {
    test: (operator, args) => {
      seen.push([operator, ...args])
      return false
    },
  })

  expect(matched).toBe(false)
  expect(seen).toEqual([['contains', { a: 1 }, ['a']]])
  const paths: unknown[] = []

  visitCondition(expression, (_node, path, kind) => paths.push([path, kind]))
  expect(paths).toEqual([
    [[], 'logical'],
    [[1], 'logical'],
    [[1, 1], 'leaf'],
    [[1, 2], 'leaf'],
    [[2], 'leaf'],
  ])
  expect(() => resolveGuards(['not', ['guard', 'missing']], {})).toThrow(
    expect.objectContaining({ code: 'GUARD_NOT_FOUND', guard: 'missing', path: [1] })
  )
})

it('rejects invalid built-in arity before resolution or custom leaf dispatch', () => {
  const resolve = () => {
    throw Error('must not resolve malformed operands')
  }
  const test = () => {
    throw Error('must not dispatch malformed operands')
  }

  expect(() => evaluate(['eq'], { resolve, test })).toThrow('expects 2 operand(s), received 0')
  expect(() => is({}, ['exists', 'field', 'extra'])).toThrow('expects 1 operand(s), received 2')
  expect(() => guard({ 'invalid-arity': ['or', true, ['eq', 1]] })).toThrow('expects 2 operand(s), received 1')
  expect(evaluate(['or', true, ['eq']])).toBe(true)
  expect(is({}, ['eq', 'missingField', undefined])).toBe(true)
  expect(is({ now: 3 }, ['cooldownReady', 'now', 1])).toBe(true)
})

it('preserves errors from input access and argument resolvers', () => {
  const failure = new Error('user error')
  const target = {
    get value(): never {
      throw failure
    },
  }

  expect(() => is(target, ['exists', 'value'])).toThrow(failure)
  expect(() =>
    evaluate(['exists', 'value'], {
      resolve: () => {
        throw failure
      },
    })
  ).toThrow(failure)
})
