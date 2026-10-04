import type { Bank } from './bank';

// No public mortgage product API: https://developer.raiffeisen.hu/start is PSD2 (accounts and payments) only.
export const RAIFFEISEN: Bank = {
  id: 'raiffeisen',
  name: 'Raiffeisen Bank',
  api: null,
  developerPortal: 'https://developer.raiffeisen.hu/start',
  offers: [
    {
      product: 'MFL lakáshitel',
      kind: 'MFL',
      annualRate: 0.0699,
      thm: 0.0722,
      fixationYears: 10,
      asOf: '2026-10-04',
      source: 'https://biztosdontes.hu/fogyasztobarat-lakashitel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.0304,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
