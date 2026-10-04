const MONTH = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', timeZone: 'UTC' });

export const formatMonth = (isoMonth: string): string => {
  return MONTH.format(new Date(`${isoMonth}-01T00:00:00Z`));
};

export const currentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};
