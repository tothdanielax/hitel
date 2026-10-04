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

const PERCENT = new Intl.NumberFormat('hu-HU', { style: 'percent', maximumFractionDigits: 2 });

export const formatPercent = (value: number): string => {
  return PERCENT.format(value);
};

export const inRange = ({ min, max }: { min: number; max: number }) => {
  return ({ value }: { value: number }): string | undefined => {
    return value < min || value > max ? `${min} és ${max} közötti érték` : undefined;
  };
};
