type Plain = Record<string, unknown>;
type WithId = Plain & { id: string };

const isPlain = (value: unknown): value is Plain => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasIds = (value: unknown): value is WithId[] => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => isPlain(item) && typeof item.id === 'string')
  );
};

const compact = (entries: [string, unknown][]): Plain | undefined => {
  const kept = entries.filter(([, value]) => value !== undefined);
  return kept.length > 0 ? Object.fromEntries(kept) : undefined;
};

// Only what differs from base, or undefined. Arrays of { id } objects diff per id:
// [{ id: 'a', rate: 1 }] against [{ id: 'a', rate: 2 }] -> { a: { rate: 1 } }.
export const diffFrom = (value: unknown, base: unknown): unknown => {
  if (hasIds(value) && hasIds(base)) {
    return compact(
      value.map((item) => [
        item.id,
        diffFrom(
          item,
          base.find(({ id }) => id === item.id)
        )
      ])
    );
  }
  if (isPlain(value) && isPlain(base)) {
    return compact(Object.entries(value).map(([key, item]) => [key, diffFrom(item, base[key])]));
  }
  return JSON.stringify(value) === JSON.stringify(base) ? undefined : value;
};

const isPrimitive = (value: unknown): value is string | number | boolean => {
  return (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  );
};

// Inverse of diffFrom for untrusted patches: keeps base's shape and only takes values of the same type.
export const mergeInto = <T>(base: T, patch: unknown): T => {
  if (hasIds(base)) {
    return (isPlain(patch) ? base.map((item) => mergeInto(item, patch[item.id])) : base) as T;
  }
  if (isPlain(base)) {
    return (
      isPlain(patch)
        ? Object.fromEntries(
            Object.entries(base).map(([key, item]) => [key, mergeInto(item, patch[key])])
          )
        : base
    ) as T;
  }
  if (Array.isArray(base)) {
    return (Array.isArray(patch) && patch.every(isPrimitive) ? patch : base) as T;
  }
  return (isPrimitive(patch) && typeof patch === typeof base ? patch : base) as T;
};
