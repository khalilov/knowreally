# knowreally specification

## Public API

The package exports the following types and functions from its root.

```ts
type Condition = boolean | readonly [operator: string, ...args: unknown[]]
type Guards = Readonly<Record<string, Condition>>

type EvaluateOptions = {
  test?: (operator: string, operands: readonly unknown[]) => boolean
  conditions?: Readonly<Record<string, (...args: unknown[]) => boolean>>
  resolve?: (value: unknown, operator: string, operand: number) => unknown
}
```

| Function                                                                 | Result                                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `guard(guards: Guards)`                                                  | Registers or replaces named definitions and returns `void`.                      |
| `is(data: unknown, condition: Condition \| undefined)`                   | Evaluates a condition against data and the module registry.                      |
| `evaluate(condition: Condition \| undefined, options?: EvaluateOptions)` | Evaluates a condition with the supplied operand resolver or leaf dispatcher.     |
| `resolveGuards(condition: Condition, guards: Guards)`                    | Returns a condition with named references expanded from the supplied dictionary. |
| `visitCondition(expression: unknown, visit)`                             | Calls the visitor on condition nodes and returns `void`.                         |

The 17 named predicates are specified below.

## Condition tree semantics

| Node                      | Behavior                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `true` or `false`         | Returns that boolean.                                                                                                         |
| `undefined`               | Matches in execution. This includes an omitted root condition and an undefined logical operand.                               |
| `['and', ...conditions]`  | Checks children in order and stops at the first false result. With no children it returns `true`.                             |
| `['or', ...conditions]`   | Checks children in order and stops at the first true result. With no children it returns `false`.                             |
| `['not', condition]`      | Inverts the result of its single child. Other operand counts throw.                                                           |
| `['guard', name]`         | In `is`, checks the registered definition with that name. Use `resolveGuards` to expand references for standalone `evaluate`. |
| `[operator, ...operands]` | Dispatches the leaf to a predicate or a supplied leaf handler.                                                                |

A visited invalid node, an unknown operator, or the wrong number of operands for a built-in predicate throws `TypeError`. The count is checked before resolving or dispatching that leaf. An explicitly supplied `undefined` counts as one operand. Evaluation stops on the first thrown error. Predicates and host callbacks can throw, and those exceptions propagate. Short-circuiting skips both the predicate and argument resolution in later branches.

## Path resolution in is

For each visited leaf, `is` resolves operands in order. The positional index is zero-based and excludes the operator.

| Operand                             | Resolution                                                                                          |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| `'$data'` in any position           | The original data value, including primitives and nullish values.                                   |
| `'$data.some.path'` in any position | `objwalk.pick(data, 'some.path')` for an object or array root.                                      |
| Any other string in position zero   | An Objwalk path relative to the data root.                                                          |
| Any other value                     | The literal value. This includes strings in later positions and objects or arrays used as operands. |

Missing paths and path reads on primitive roots yield `undefined`. Named array segments such as `items[0].id` follow Objwalk's lookup rules. For example, `['eq', 'status', 'open']` compares a field against a literal, while `['eq', 'status', '$data.expectedStatus']` compares two fields. To check an input string directly, use `is(input, ['typeIs', '$data', 'string'])`.

Knowreally's `is` resolves paths against its one data value. Hosts can use `evaluate` for other roots such as Slapflow's `$context`, `$props` and `$variables`.

## Guard registration and expansion

`guard(definitions)` merges the new definitions into the module registry. A batch can reference earlier registrations or a name declared later in the same batch. Reusing a name replaces its definition, and old dependents are resolved again against the merged set.

Registration expands the candidate set before replacing the live registry. Missing references, cycles, malformed condition nodes, invalid built-in operand counts and unknown predicate names reject the batch. Earlier successful registrations remain usable. Read guard definitions as configuration and update them by registering a new batch. Operand objects remain references, so mutable operand values can affect later evaluation.

The registry belongs to the loaded module instance. To keep definitions local to a host configuration, call `resolveGuards(condition, guards)` with that configuration's dictionary and evaluate the resulting tree. The function follows reachable references and expands them inside `and`, `or`, and `not`. It leaves leaf operands untouched and permits custom leaf names for the host's evaluator. You can reuse a resolved tree with different input values.

Missing and cyclic references throw a `TypeError` with the following fields.

| Field   | Meaning                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `code`  | `GUARD_NOT_FOUND` or `GUARD_CYCLE`.                                                                                             |
| `guard` | The referenced name where expansion failed.                                                                                     |
| `path`  | Numeric tuple indexes from the root of the expanded expression. Index zero is the operator. An error at the root has path `[]`. |

For example, resolving `['not', ['guard', 'missing']]` against an empty dictionary throws with `guard: 'missing'` and `path: [1]`. Syntax errors such as a guard reference without a string name also throw `TypeError`.

## Standalone evaluation and inspection

`evaluate(condition, options)` uses literal operands by default. It dispatches a leaf in this order.

1. If `test` is supplied, call `test(operator, rawOperands)`. The host owns resolving those operands and choosing their predicate.
2. Otherwise, find the built-in predicate or a custom function from `conditions`. Built-in names have priority.
3. Resolve each operand with `resolve(value, operator, index)` if supplied, then call the predicate with those values.

A Slapflow adapter can use `test` to retain its field-type checks, custom condition callbacks and path diagnostics. Logical traversal and short-circuiting remain the same with either dispatch mode.

`visitCondition(expression, visit)` is a structural, depth-first, pre-order walk. The callback receives `(node, path, kind)`, with `kind` set to `logical`, `invalid-logical`, or `leaf`. The root has path `[]`. Logical operands start at tuple index one. Malformed logical nodes are visited once. The walk reaches logical children even when evaluation would short-circuit, and treats predicate operands and guard names as leaf data. It performs no guard expansion or predicate dispatch.

## Named predicates

Direct calls take values as-is. Predicates apply their own validation and conversion rules. For example, an unsupported collection passed to `includes` returns false, while nullish input passed to `empty` returns true. There is no schema check on the entire data object.

In condition trees, `truthy`, `falsy`, `exists`, `missing`, `empty` and `notEmpty` require one operand. `cooldownReady` accepts two or three. All other built-in predicates require two. Custom leaf functions own their operand contracts.

Numeric comparisons return false for symbol operands, values that convert to `NaN` and objects without primitive conversion hooks. String membership returns false for objects without such hooks. Successful native coercion still applies. Exceptions from property access, proxies and user-supplied conversion hooks propagate.

| Function                                         | Semantics                                                                                                                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `eq(left, right)`                                | `Object.is` equality. `NaN` equals itself and signed zeroes differ.                                                                                                                                    |
| `neq(left, right)`, `changed(current, previous)` | Negation of `Object.is` equality. `changed` is an alias of `neq`.                                                                                                                                      |
| `gt`, `gte`, `lt`, `lte`                         | Convert each operand with `Number` and apply the corresponding comparison. Numeric strings are accepted. Conversion exceptions propagate.                                                              |
| `truthy(value)`, `falsy(value)`                  | JavaScript boolean coercion and its inverse. Empty arrays and objects are truthy.                                                                                                                      |
| `exists(value)`, `missing(value)`                | Presence means any value other than `null` or `undefined`. `false`, `0` and the empty string are present.                                                                                              |
| `empty(value)`, `notEmpty(value)`                | Check string or array length, Map or Set size, or the number of own enumerable string keys on an object. Other inputs count as empty.                                                                  |
| `includes(collection, value)`                    | For strings, searches for `String(value)`. For arrays and Sets, checks membership. Unsupported collections return `false`.                                                                             |
| `contains(target, fields)`                       | Requires a non-array object and a list of string keys. Every key must be an own property with a non-nullish value. Keys are literal, duplicates are allowed, and an empty list matches a valid object. |
| `typeIs(value, expected)`                        | Accepts `string`, `number`, `finite-number`, `boolean`, `array` and `record`. A record is a non-null object excluding arrays. `number` includes `NaN` and infinity. Other type names return `false`.   |
| `cooldownReady(now, lastAt, cooldown)`           | Returns true when `lastAt` is nullish. Otherwise compares `Number(now) - Number(lastAt)` with `Number(cooldown ?? 0)`.                                                                                 |

`typeIs` returns a boolean. A TypeScript caller that needs static narrowing can keep a native type guard at that boundary.
