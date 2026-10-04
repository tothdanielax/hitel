import { MILLION, PERCENT } from '../constants';

export const formatRate = (rate: number): string => {
  return `${(rate * PERCENT).toLocaleString('hu-HU', { maximumFractionDigits: 2 })}%`;
};

export const formatMillions = (amount: number): string => {
  return `${(amount / MILLION).toLocaleString('hu-HU')} millió Ft`;
};
