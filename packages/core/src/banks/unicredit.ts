import type { Bank } from './bank';

// No public mortgage product API: https://developer.unicredit.eu is PSD2 (accounts and payments) only.
export const UNICREDIT: Bank = {
  id: 'unicredit',
  name: 'UniCredit Bank',
  api: null,
  developerPortal: 'https://developer.unicredit.eu',
  offers: [
    {
      product: 'Stabil Kamat MFL',
      kind: 'MFL',
      annualRate: 0.0695,
      thm: 0.075,
      fixationYears: 'term',
      asOf: '2026-10-04',
      source: 'https://biztosdontes.hu/fogyasztobarat-lakashitel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.0289,
      thm: 0.0296,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
