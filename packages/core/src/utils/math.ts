export const sum = (values: number[]): number => {
  return values.reduce((total, value) => total + value, 0);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const subsets = <T>(items: T[]): T[][] => {
  return items.reduce<T[][]>(
    (all, item) => [...all, ...all.map((subset) => [...subset, item])],
    [[]]
  );
};

// Every ordering of every subset, e.g. [a, b] -> [], [a], [b], [a, b], [b, a].
export const arrangements = <T>(items: T[]): T[][] => {
  return [
    [],
    ...items.flatMap((item, index) =>
      arrangements(items.filter((_, other) => other !== index)).map((rest) => [item, ...rest])
    )
  ];
};
