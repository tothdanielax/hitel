import type { Bank } from './bank';

// No public mortgage product API: https://www.kh.hu/web/kh-api/home is PSD2 (accounts and payments) only.
export const KH: Bank = {
  id: 'kh',
  name: 'K&H Bank',
  api: null,
  developerPortal: 'https://www.kh.hu/web/kh-api/home',
  offers: [
    {
      product: 'MFL lakáshitel',
      kind: 'MFL',
      annualRate: 0.0729,
      thm: 0.0768,
      fixationYears: 5,
      asOf: '2026-10-04',
      source: 'https://biztosdontes.hu/fogyasztobarat-lakashitel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.031,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
