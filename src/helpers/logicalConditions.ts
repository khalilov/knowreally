export const logicalConditions: Readonly<
  Record<string, (args: unknown[], check: (node: unknown) => boolean) => boolean>
> = {
  and: (args, check) => args.every(check),
  or: (args, check) => args.some(check),
  not: (args, check) => {
    if (args.length === 1) {
      return check(args[0]) === false
    }

    throw new TypeError('not requires exactly one condition')
  },
}
