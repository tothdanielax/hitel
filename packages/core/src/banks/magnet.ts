import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://demo.magnetbank.hu/psd2/doc/ is PSD2 (accounts and payments) only.
export const MAGNET: Bank = {
  id: 'magnet',
  name: 'MagNet Bank',
  offers: [
    {
      product: 'Stabil Tízes',
      kind: 'MARKET',
      annualRate: 0.063,
      fixationYears: 10,
      source: OFFER_SOURCE.MARKET
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.028,
      thm: 0.0286,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
