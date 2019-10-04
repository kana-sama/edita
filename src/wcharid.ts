export type t = { client: number; clock: number };

export function compare(a: t, b: t): -1 | 0 | 1 {
  if (a.client === b.client) {
    if (a.clock === b.clock) return 0;
    return a.clock < b.clock ? -1 : 1;
  } else {
    return a.client < b.client ? -1 : 1;
  }
}

export function le(a: t, b: t): boolean {
  return compare(a, b) === -1;
}

export function eq(a: t, b: t): boolean {
  return compare(a, b) === 0;
}

export const beg: t = { client: -1, clock: 0 };
export const fin: t = { client: -1, clock: 1 };
