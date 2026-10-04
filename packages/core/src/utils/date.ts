import { ISO_MONTH_LENGTH, MONTHS_PER_YEAR } from '../constants';

// ISO months ('YYYY-MM') keep dates timezone free.
const MONTH = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', timeZone: 'UTC' });
const DAY = new Intl.DateTimeFormat('hu-HU', { dateStyle: 'medium', timeZone: 'UTC' });

export const formatMonth = (isoMonth: string): string => {
  return MONTH.format(new Date(`${isoMonth}-01T00:00:00Z`));
};

export const formatDate = (isoDate: string): string => {
  return DAY.format(new Date(`${isoDate}T00:00:00Z`));
};

export const monthsBetween = (from: string, to: string): number => {
  return toIndex(to) - toIndex(from);
};

export const addMonths = (month: string, count: number): string => {
  const total = toIndex(month) + count;
  const year = Math.floor(total / MONTHS_PER_YEAR);
  const monthNumber = (total % MONTHS_PER_YEAR) + 1;
  return `${year}-${String(monthNumber).padStart(2, '0')}`;
};

export const currentMonth = (): string => {
  return new Date().toISOString().slice(0, ISO_MONTH_LENGTH);
};

const toIndex = (month: string): number => {
  const [year = 0, monthNumber = 1] = month.split('-').map(Number);
  return year * MONTHS_PER_YEAR + monthNumber - 1;
};
