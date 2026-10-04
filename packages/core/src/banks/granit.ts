import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://granitbank.hu/fejlesztoi-portal is PSD2 (accounts and payments) only.
export const GRANIT: Bank = {
  id: 'granit',
  name: 'Gránit Bank',
  offers: [
    {
      product: 'Piaci lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0618,
      fixationYears: 10,
      source: OFFER_SOURCE.MARKET
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
