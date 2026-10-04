import type { Bank } from './bank';

// No public mortgage product API: https://www.otpbank.hu/portal/en/psd2 is PSD2 (accounts and payments) only.
export const OTP: Bank = {
  id: 'otp',
  name: 'OTP Bank',
  api: null,
  developerPortal: 'https://www.otpbank.hu/portal/en/psd2',
  offers: [
    {
      product: '1x1 Évnyerő Lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0619,
      fixationYears: 10,
      asOf: '2026-09-26',
      source:
        'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel'
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
