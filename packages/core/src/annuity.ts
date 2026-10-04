export const monthlyPayment = (principal: number, annualRate: number, months: number): number => {
  if (annualRate === 0) return principal / months;
  const rate = annualRate / 12;
  return (principal * rate) / (1 - (1 + rate) ** -months);
};
