import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://developer.unicredit.eu is PSD2 (accounts and payments) only.
export const UNICREDIT: Bank = {
  id: 'unicredit',
  name: 'UniCredit Bank',
  offers: [
    {
      product: 'Stabil Kamat MFL',
      kind: 'MFL',
      annualRate: 0.0695,
      thm: 0.075,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.MFL
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.0289,
      thm: 0.0296,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
