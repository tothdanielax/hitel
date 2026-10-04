import type { Bank } from './bank';

// No public mortgage product API: https://api.cib.hu is PSD2 (accounts and payments) only.
export const CIB: Bank = {
  id: 'cib',
  name: 'CIB Bank',
  api: null,
  developerPortal: 'https://api.cib.hu',
  offers: [
    {
      product: '10 éves fix lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0664,
      fixationYears: 10,
      asOf: '2026-09-26',
      source:
        'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel'
    },
    {
      product: '10 MFL',
      kind: 'MFL',
      annualRate: 0.0674,
      thm: 0.0711,
      fixationYears: 10,
      asOf: '2026-10-04',
      source: 'https://biztosdontes.hu/fogyasztobarat-lakashitel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.0295,
      thm: 0.0301,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
