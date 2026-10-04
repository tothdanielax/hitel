import type { Bank } from './bank';

// No public mortgage product API: https://developers.erstegroup.com is PSD2 (accounts and payments) only.
export const ERSTE: Bank = {
  id: 'erste',
  name: 'Erste Bank',
  api: null,
  developerPortal: 'https://developers.erstegroup.com',
  offers: [
    {
      product: 'Piaci lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0634,
      fixationYears: 10,
      asOf: '2026-09-26',
      source:
        'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.0306,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
