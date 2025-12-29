export function previousPeriod(period: string) {
  let [year, month] = period.split('-').map(Number);
  month--;
  if (month === 0) {
    month = 12;
    year--;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}
