# knowreally

Register named guards and evaluate conditions against JavaScript objects. Use the same predicates directly when you already have the values.

> 🤖 Coding agent? Load the [knowreally skill](https://github.com/khalilov/knowreally/blob/development/skills/knowreally/SKILL.md).
> Need every edge case? Open the [full specification](https://github.com/khalilov/knowreally/blob/development/SPEC.md).

## Install

```sh
npm install knowreally
```

The package provides ESM, CommonJS, and TypeScript declarations.

## Register and check

```ts
import { guard, is } from 'knowreally'

guard({
  'placement-ready': ['and', ['guard', 'placement-target'], ['exists', 'placement']],
  'placement-target': ['typeIs', 'gameObjectId', 'string'],
})

is({ gameObjectId: 'go-1', placement: {} }, ['guard', 'placement-ready']) // true
is({ gameObjectId: 'go-1' }, ['guard', 'placement-ready']) // false
```

Call `guard` during setup. It resolves forward references within the batch, detects cycles, and rejects the whole batch if any definition fails. `is` uses the registered tree and short-circuits `and` and `or`.

## Paths and values

```ts
import { contains, eq, includes, is } from 'knowreally'

const order = { items: [{ id: 'p-1' }], selectedId: 'p-1', status: 'open' }

is(order, ['eq', 'items[0].id', '$data.selectedId']) // true
is(order, ['eq', 'status', 'open']) // true
eq(order.status, 'open') // true
contains({ enabled: false, count: 0 }, ['enabled', 'count']) // true
includes(NaN, '213') // false
```

In an `is` leaf, a string in operand zero is an Objwalk path. Later operands are literals by default. Use `$data.<path>` in any position to read a path explicitly, or `$data` to use the entire input. Direct predicates take values as supplied.

## Choose an API

| API                                                                   | Use it when                                                                                                      |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `guard(definitions)` and `is(data, condition)`                        | The same named conditions should be available across the application, or you want an inline tree over an object. |
| `eq`, `includes`, `contains`, and other predicates                    | Values are already resolved and you need a boolean in ordinary code.                                             |
| `resolveGuards(condition, guards)` and `evaluate(condition, options)` | A host such as Slapflow owns its guard definitions, reference syntax, or predicate dispatch.                     |
| `visitCondition(condition, visit)`                                    | A validator or tool needs to inspect condition nodes and their locations.                                        |

See [SPEC.md](./SPEC.md) for signatures and edge cases. For coding agents, use the [Knowreally skill](./skills/knowreally/SKILL.md) and its [application cases](./skills/knowreally/references/use-cases.md).
