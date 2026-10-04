export const OFFER_KIND = {
  MARKET: 'MARKET',
  MFL: 'MFL',
  OTTHON_START: 'OTTHON_START'
} as const;
type OfferKind = keyof typeof OFFER_KIND;

export type BankOffer = {
  product: string;
  kind: OfferKind;
  annualRate: number;
  thm?: number;
  fixationYears: number | 'term';
  asOf: string;
  source: string;
};

export type Bank = {
  id: string;
  name: string;
  // null: no public mortgage product API exists (see docs/banks.md), offers are maintained by hand
  api: null;
  developerPortal: string;
  offers: BankOffer[];
};
