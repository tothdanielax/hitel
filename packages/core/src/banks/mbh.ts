import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://portal.sandbox2.mbhbank.hu/ is PSD2 (accounts and payments) only.
export const MBH: Bank = {
  id: 'mbh',
  name: 'MBH Bank',
  offers: [
    {
      product: 'Piaci lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0669,
      fixationYears: 10,
      source: OFFER_SOURCE.MARKET
    },
    {
      product: 'MFL lakáshitel',
      kind: 'MFL',
      annualRate: 0.0699,
      thm: 0.0736,
      fixationYears: 10,
      source: OFFER_SOURCE.MFL
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.0289,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
