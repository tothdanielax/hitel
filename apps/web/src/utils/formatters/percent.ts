const PERCENT = new Intl.NumberFormat('hu-HU', { style: 'percent', maximumFractionDigits: 2 });

export const formatPercent = (value: number): string => {
  return PERCENT.format(value);
};
