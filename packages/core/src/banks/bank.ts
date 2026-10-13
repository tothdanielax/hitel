type OfferKind = 'MARKET' | 'MFL' | 'OTTHON_START';

type OfferSource = {
  url: string;
  asOf: string;
};

export type BankOffer = {
  product: string;
  kind: OfferKind;
  annualRate: number;
  thm?: number;
  // Years of fixed rate; FIXED_FOR_TERM means fixed until maturity.
  fixationYears: number;
  source: OfferSource;
};

export type Bank = {
  id: string;
  name: string;
  offers: BankOffer[];
};

export const FIXED_FOR_TERM = 0;

// Headline "from" rates; check each bank's lakáshitel hirdetmény before relying on them.
export const OFFER_SOURCE = {
  MARKET: {
    url: 'https://telex.hu/nevertek/2026/09/26/lealdozhat-a-vegig-fix-kamatoknak-a-piaci-lakashiteleknel',
    asOf: '2026-09-26'
  },
  MFL: { url: 'https://biztosdontes.hu/fogyasztobarat-lakashitel', asOf: '2026-10-04' },
  OTTHON_START: {
    url: 'https://biztosdontes.hu/cikkek/otthon-start-3-szazalek-alatti-kamat',
    asOf: '2026-08-08'
  }
} as const satisfies Record<OfferKind, OfferSource>;
