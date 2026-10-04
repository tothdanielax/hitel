import { BANKS } from './banks';
import type { BankOffer } from './banks/bank';
import {
  CSOK_PLUSZ,
  DEFAULT_BOND_YIELD,
  DEFAULT_INFLATION_RATE,
  DEFAULT_REPRICE_RATE,
  FALUSI_CSOK_LOAN
} from './constants';

export type OfferSetting = BankOffer & {
  id: string;
  bankName: string;
  enabled: boolean;
};

// Market assumptions the user may override; defaults come from constants.ts and the bank files.
export type PlanSettings = {
  bondYield: number;
  inflationRate: number;
  repriceRate: number;
  csokPluszRate: number;
  falusiCsokLoanRate: number;
  offers: OfferSetting[];
};

export const DEFAULT_SETTINGS: PlanSettings = {
  bondYield: DEFAULT_BOND_YIELD,
  inflationRate: DEFAULT_INFLATION_RATE,
  repriceRate: DEFAULT_REPRICE_RATE,
  csokPluszRate: CSOK_PLUSZ.annualRate,
  falusiCsokLoanRate: FALUSI_CSOK_LOAN.annualRate,
  offers: BANKS.flatMap((bank) =>
    bank.offers.map((offer, index) => ({
      ...offer,
      id: `${bank.id}-${index}`,
      bankName: bank.name,
      enabled: true
    }))
  )
};
