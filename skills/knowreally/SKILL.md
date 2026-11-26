---
name: knowreally
description: Define, reuse, or debug declarative conditions with Knowreally. Use for guard registration, is checks over objects, named predicates, or host adapters for condition evaluation and diagnostics.
---

# Knowreally

Choose the API that fits the values the caller already has.

- Use a named predicate when the caller already holds the values. Use `contains` for required own fields and `includes` for collection membership.
- Use `is(data, condition)` for a condition that reads object paths. The first string operand is a path. Later operands are literals unless they use `$data` or `$data.<path>`.
- Use `guard(definitions)` during setup for shared named rules. Register cross-referenced definitions in one batch. An update re-resolves dependents, and a rejected batch leaves prior registrations available.
- Use `resolveGuards` with the host's dictionary, then `evaluate`, when the host owns configuration or uses another operand syntax. For Slapflow, preserve the runtime's scopes, custom conditions, field types and diagnostics.

Use `and` and `or` to compose rules. `not` takes one child. When debugging a check, distinguish a false outcome from an invalid condition. Check path versus literal operand positions first, then nullish presence, type and short-circuit order.

Read [use-cases.md](references/use-cases.md) for object guards, presence and membership, custom operators, Slapflow adapters and validation. See the [package specification](../../SPEC.md) for exact signatures and error behavior. Check the installed package's declarations when working against a different version.
