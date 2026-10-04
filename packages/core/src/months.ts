// ISO months ('YYYY-MM') keep dates timezone free.
export const monthsBetween = (from: string, to: string): number => {
  const [fromYear = 0, fromMonth = 0] = from.split('-').map(Number);
  const [toYear = 0, toMonth = 0] = to.split('-').map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
};

export const addMonths = (month: string, count: number): string => {
  const [year = 0, monthIndex = 1] = month.split('-').map(Number);
  const total = year * 12 + (monthIndex - 1) + count;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
};
