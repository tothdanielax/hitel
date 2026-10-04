import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://developer.raiffeisen.hu/start is PSD2 (accounts and payments) only.
export const RAIFFEISEN: Bank = {
  id: 'raiffeisen',
  name: 'Raiffeisen Bank',
  offers: [
    {
      product: 'MFL lakáshitel',
      kind: 'MFL',
      annualRate: 0.0699,
      thm: 0.0722,
      fixationYears: 10,
      source: OFFER_SOURCE.MFL
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.0304,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
