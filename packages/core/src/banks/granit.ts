import type { Bank } from './bank';

// No public mortgage product API: https://granitbank.hu/fejlesztoi-portal is PSD2 (accounts and payments) only.
export const GRANIT: Bank = {
  id: 'granit',
  name: 'Gránit Bank',
  api: null,
  developerPortal: 'https://granitbank.hu/fejlesztoi-portal',
  offers: [
    {
      product: 'Piaci lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0618,
      fixationYears: 10,
      asOf: '2026-09-26',
      source:
        'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
