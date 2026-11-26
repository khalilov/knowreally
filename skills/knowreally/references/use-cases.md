# Knowreally application cases

## Reuse a UI guard

Register shared terms once. Branch-specific rules can reference them with `['guard', name]`.

```ts
import { guard, is } from 'knowreally'

guard({
  'queue-operation': ['typeIs', 'dataset.operationId', 'string'],
  'queue-visible': ['eq', 'view.hidden', false],
})

const event = { dataset: { operationId: 'op-1' }, view: { hidden: false } }
const canOpen = is(event, ['and', ['guard', 'queue-operation'], ['guard', 'queue-visible']])
// true
```

For “neither condition matches,” use `['not', ['or', first, second]]`. To guard an optional read, put the existence check before the branch that needs it.

## Check presence, membership, and types

```ts
import { contains, includes, is } from 'knowreally'

const payload = { requestId: 'r-1', enabled: false, count: 0 }

contains(payload, ['requestId', 'enabled', 'count']) // true
includes(['queued', 'running'], 'running') // true
is(payload, ['and', ['contains', '$data', ['requestId']], ['typeIs', 'requestId', 'string']]) // true
```

`contains` accepts present falsy values and checks literal own keys. If a required field also needs a specific type, compose a `typeIs` condition. For nonempty input, use `notEmpty` alongside the type check. In comparisons, use `$data.secondField` on the right to read a field. A bare string on the right stays literal.

## Evaluate configuration owned by a host

Use a local guard dictionary and supply the host's argument resolver. The same expanded tree can run against new data.

```ts
import { evaluate, resolveGuards } from 'knowreally'

const condition = resolveGuards(['and', ['guard', 'ready'], ['even', '$count']], {
  ready: ['truthy', '$ready'],
})

evaluate(condition, {
  resolve: (value) => {
    if (value === '$ready') return true
    if (value === '$count') return 4

    return value
  },
  conditions: { even: (value) => typeof value === 'number' && value % 2 === 0 },
}) // true
```

When a host already has a condition registry, use `test(operator, operands)` to dispatch a leaf with its raw operands. For Slapflow this keeps reference resolution, typed `contains`, custom callbacks and diagnostic paths in the host. Resolve graph guards from the loaded config snapshot. Public `guard` registrations belong to the module instance.

## Inspect or explain a failed condition

Walk logical nodes to check shape and locate invalid references. Predicate operands remain data, even when an operand is itself an array.

```ts
import { visitCondition } from 'knowreally'

const locations: number[][] = []

visitCondition(['and', ['includes', ['a', 'b'], 'a'], ['not']], (_node, path, kind) => {
  if (kind === 'invalid-logical') {
    locations.push([...path])
  }
})

// locations is [[2]]
```

Evaluation short-circuits and can skip a malformed branch. Use structural inspection or guard resolution during validation when every referenced condition needs checking. Prefix returned tuple indexes with the host's config path when displaying diagnostics.
