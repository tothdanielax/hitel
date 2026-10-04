export const subsets = <T>(items: T[]): T[][] => {
  return items.reduce<T[][]>(
    (all, item) => [...all, ...all.map((subset) => [...subset, item])],
    [[]]
  );
};
