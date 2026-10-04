import type { Bank } from './bank';

// No public mortgage product API: https://portal.sandbox2.mbhbank.hu/ is PSD2 (accounts and payments) only.
export const MBH: Bank = {
  id: 'mbh',
  name: 'MBH Bank',
  api: null,
  developerPortal: 'https://portal.sandbox2.mbhbank.hu/',
  offers: [
    {
      product: 'Piaci lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0669,
      fixationYears: 10,
      asOf: '2026-09-26',
      source:
        'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel'
    },
    {
      product: 'MFL lakáshitel',
      kind: 'MFL',
      annualRate: 0.0699,
      thm: 0.0736,
      fixationYears: 10,
      asOf: '2026-10-04',
      source: 'https://biztosdontes.hu/fogyasztobarat-lakashitel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.0289,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
