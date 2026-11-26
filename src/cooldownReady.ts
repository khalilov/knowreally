import { toNumber } from './helpers/toNumber'

export const cooldownReady = (now: unknown, lastAt: unknown, cooldown?: unknown): boolean => {
  if (lastAt == null) {
    return true
  }
  return toNumber(now) - toNumber(lastAt) >= toNumber(cooldown ?? 0)
}
