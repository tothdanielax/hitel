const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0
});
const PERCENT = new Intl.NumberFormat('hu-HU', { style: 'percent', maximumFractionDigits: 2 });
const MONTH = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long' });

export const formatHuf = (value: number): string => {
  return HUF.format(value);
};

export const formatPercent = (value: number): string => {
  return PERCENT.format(value);
};

export const formatMonth = (isoMonth: string): string => {
  return MONTH.format(new Date(`${isoMonth}-01`));
};
