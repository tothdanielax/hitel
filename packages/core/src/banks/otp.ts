import { FIXED_FOR_TERM, OFFER_SOURCE, type Bank } from './bank';

// No public mortgage product API: https://www.otpbank.hu/portal/en/psd2 is PSD2 (accounts and payments) only.
export const OTP: Bank = {
  id: 'otp',
  name: 'OTP Bank',
  offers: [
    {
      product: '1x1 Évnyerő Lakáshitel',
      kind: 'MARKET',
      annualRate: 0.0619,
      fixationYears: 10,
      source: OFFER_SOURCE.MARKET
    },
    {
      product: 'Otthon Start',
      kind: 'OTTHON_START',
      annualRate: 0.03,
      thm: 0.031,
      fixationYears: FIXED_FOR_TERM,
      source: OFFER_SOURCE.OTTHON_START
    }
  ]
};
