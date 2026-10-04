const HUF = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0
});

export const formatHuf = (value: number): string => {
  return HUF.format(value);
};
