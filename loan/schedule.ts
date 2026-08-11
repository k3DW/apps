import { calculateMonthlyPayment, monthlyRateFromNominal } from "./finance";
import { absMonthIndex } from "./calendar";
import { LoanState } from "./state";
import { LoanEvent, EVENT_TYPES } from "./events/events";

interface ScheduleMonth {
  idx: number;
  interest: number;
  principalPaid: number;
  lumpSum: number;
  totalCash: number;
  balance: number;
}

interface ScheduleResult {
  schedule: ScheduleMonth[];
  monthlyPayment: number; // contractual fixed payment
  totalPaid: number;
  totalInterest: number;
  payoffIdx: number; // month index one past the last payment (exclusive)
}

export function generateSchedule(loan: LoanState): ScheduleResult {
  const monthlyPayment = calculateMonthlyPayment({
    principal: Number(loan.principal),
    years: Number(loan.years),
    annualRatePct: Number(loan.rate),
    compounding: loan.compounding,
  });
  const monthlyRate = monthlyRateFromNominal(Number(loan.rate), loan.compounding);
  const startIdx = absMonthIndex(loan.startMonth, loan.startYear);
  const nominalMonths = Number(loan.years) * 12 || 0;

  const eventsByMonth = new Map<number, LoanEvent[]>();
  for (const ev of loan.events) {
    const list = eventsByMonth.get(ev.monthIndex) || [];
    list.push(ev);
    eventsByMonth.set(ev.monthIndex, list);
  }

  const schedule: ScheduleMonth[] = [];
  let balance = Number(loan.principal) || 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let idx = startIdx;
  const safetyCap = Math.max(nominalMonths, 12); // events only ever shorten payoff, this is a hard backstop

  while (balance > 0.005 && idx - startIdx < safetyCap) {
    const interest = balance * monthlyRate;
    let principalPaid = monthlyPayment - interest;
    if (principalPaid < 0) principalPaid = 0;
    if (principalPaid > balance) principalPaid = balance;

    let lumpSum = 0;
    for (const ev of eventsByMonth.get(idx) || []) {
      const config = EVENT_TYPES[ev.type];
      if (config) lumpSum += config.apply(ev.params);
    }
    const remainingAfterRegular = balance - principalPaid;
    if (lumpSum > remainingAfterRegular) lumpSum = remainingAfterRegular;
    if (lumpSum < 0) lumpSum = 0;

    balance = balance - principalPaid - lumpSum;
    if (balance < 0.005) balance = 0;

    const totalCash = interest + principalPaid + lumpSum;
    totalInterest += interest;
    totalPaid += totalCash;

    schedule.push({ idx, interest, principalPaid, lumpSum, totalCash, balance });
    idx++;
  }

  return { schedule, monthlyPayment, totalPaid, totalInterest, payoffIdx: idx };
}
