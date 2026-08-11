export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function absMonthIndex(month: number, year: number): number {
  return year * 12 + (month - 1);
}

export function indexToLabel(idx: number, short = true): string {
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  const name = MONTH_NAMES[month - 1];
  return `${short ? name.slice(0, 3) : name} ${year}`;
}
