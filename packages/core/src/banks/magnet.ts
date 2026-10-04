import type { Bank } from './bank';

// No public mortgage product API: https://demo.magnetbank.hu/psd2/doc/ is PSD2 (accounts and payments) only.
export const MAGNET: Bank = {
  id: 'magnet',
  name: 'MagNet Bank',
  api: null,
  developerPortal: 'https://demo.magnetbank.hu/psd2/doc/',
  offers: [
    {
      product: 'Stabil Tízes',
      kind: 'MARKET',
      annualRate: 0.063,
      fixationYears: 10,
      asOf: '2026-09-26',
      source:
        'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel'
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.028,
      thm: 0.0286,
      fixationYears: 'term',
      asOf: '2026-08-08',
      source: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat'
    }
  ]
};
