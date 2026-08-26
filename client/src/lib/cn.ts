/**
 * Tiny className combiner (clsx-style) with no dependency. Accepts strings,
 * arrays, and conditional objects, and drops falsy values.
 */
export type ClassValue = string | number | null | false | undefined | ClassValue[] | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  const walk = (value: ClassValue): void => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === 'object') {
      for (const [key, enabled] of Object.entries(value)) {
        if (enabled) out.push(key);
      }
    }
  };

  inputs.forEach(walk);
  return out.join(' ');
}
