export type LoanLine = {
  name: string;
  amount: number;
  rate: number;
  termYears: number;
  monthly: number;
  note: string;
};

export type TimelineEvent = {
  month: string;
  title: string;
  monthlyAfter: number;
};

export type CalculationResult = {
  averageMonthly: number;
  initialMonthly: number;
  totalRepayment: number;
  totalSubsidy: number;
  loans: LoanLine[];
  timeline: TimelineEvent[];
  warnings: string[];
};

// ponytail: static mock until @hitel/core calculates real results
export const MOCK_RESULT: CalculationResult = {
  averageMonthly: 287_000,
  initialMonthly: 237_106,
  totalRepayment: 86_100_000,
  totalSubsidy: 7_200_000,
  loans: [
    {
      name: 'Otthon Start',
      amount: 50_000_000,
      rate: 0.03,
      termYears: 25,
      monthly: 237_106,
      note: 'Fix 3% a teljes futamidőre'
    },
    {
      name: 'Babaváró',
      amount: 11_000_000,
      rate: 0,
      termYears: 20,
      monthly: 45_833,
      note: 'Szünetel az 1. gyermek után, 30% elengedés a 2. gyermeknél'
    },
    {
      name: 'Banki kiegészítő (MBH, 10 év fix)',
      amount: 9_000_000,
      rate: 0.0629,
      termYears: 20,
      monthly: 65_800,
      note: 'Kamatperiódus végén átárazódik'
    }
  ],
  timeline: [
    { month: '2026-12', title: 'Folyósítás, törlesztés indul', monthlyAfter: 348_739 },
    { month: '2027-09', title: '1. gyermek: Babaváró szünetel 3 évig', monthlyAfter: 302_906 },
    { month: '2030-03', title: '2. gyermek: Babaváró 30% elengedés', monthlyAfter: 302_906 },
    { month: '2030-09', title: 'Babaváró törlesztés újraindul', monthlyAfter: 335_000 },
    { month: '2036-12', title: 'Banki kamatperiódus vége, átárazás', monthlyAfter: 335_000 },
    { month: '2046-12', title: 'Babaváró és banki hitel lejár', monthlyAfter: 237_106 },
    { month: '2051-12', title: 'Otthon Start lejár', monthlyAfter: 0 }
  ],
  warnings: ['Minta adatok: a számítás még nem valós']
};
