const MONTH = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', timeZone: 'UTC' });

export const formatMonth = (isoMonth: string): string => {
  return MONTH.format(new Date(`${isoMonth}-01T00:00:00Z`));
};

export const nextMonth = (): string => {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toISOString().slice(0, 7);
};
