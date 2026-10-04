const MONTH = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', timeZone: 'UTC' });
const DAY = new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeZone: 'UTC' });

export const formatMonth = (isoMonth: string): string => {
  return MONTH.format(new Date(`${isoMonth}-01T00:00:00Z`));
};

export const formatDate = (isoDate: string): string => {
  return DAY.format(new Date(`${isoDate}T00:00:00Z`));
};
