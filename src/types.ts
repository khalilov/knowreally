export type Condition = boolean | readonly [operator: string, ...args: unknown[]]

export type Guards = Readonly<Record<string, Condition>>

export type EvaluateOptions = {
  test?: (operator: string, operands: readonly unknown[]) => boolean
  conditions?: Readonly<Record<string, (...args: unknown[]) => boolean>>
  resolve?: (value: unknown, operator: string, operand: number) => unknown
}
