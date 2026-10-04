import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://developers.erstegroup.com is PSD2 (accounts and payments) only.
export const ERSTE: Bank = {
  id: 'erste',
  name: 'Erste Bank',
  offers: [
    {
      product: 'Piaci lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0634,
      fixationYears: 10,
      source: OFFER_SOURCE.MARKET
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.0306,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
