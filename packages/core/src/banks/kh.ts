import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://www.kh.hu/web/kh-api/home is PSD2 (accounts and payments) only.
export const KH: Bank = {
  id: 'kh',
  name: 'K&H Bank',
  offers: [
    {
      product: 'MFL lakáshitel',
      kind: 'MFL',
      annualRate: 0.0729,
      thm: 0.0768,
      fixationYears: 5,
      source: OFFER_SOURCE.MFL
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.031,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
