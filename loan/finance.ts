export type Compounding = "monthly" | "semiannual";

export function monthlyRateFromNominal(annualRatePct: number, compounding: Compounding): number {
  const annual = annualRatePct / 100;
  if (compounding === "semiannual") {
    const semiAnnualRate = annual / 2;
    return Math.pow(1 + semiAnnualRate, 2 / 12) - 1;
  }
  return annual / 12;
}

interface MonthlyPaymentInput {
  principal: number;
  years: number;
  annualRatePct: number;
  compounding: Compounding;
}

export function calculateMonthlyPayment({
  principal,
  years,
  annualRatePct,
  compounding,
}: MonthlyPaymentInput): number {
  const P = Number(principal);
  const n = Number(years) * 12;
  const r = monthlyRateFromNominal(Number(annualRatePct), compounding);
  if (!P || !n) return 0;
  if (!r) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function formatCurrency(amount: number): string {
  return (amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
