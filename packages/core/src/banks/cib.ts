import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://api.cib.hu is PSD2 (accounts and payments) only.
export const CIB: Bank = {
  id: 'cib',
  name: 'CIB Bank',
  offers: [
    {
      product: '10 éves fix lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0664,
      fixationYears: 10,
      source: OFFER_SOURCE.MARKET
    },
    {
      product: '10 MFL',
      kind: 'MFL',
      annualRate: 0.0674,
      thm: 0.0711,
      fixationYears: 10,
      source: OFFER_SOURCE.MFL
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.0295,
      thm: 0.0301,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
