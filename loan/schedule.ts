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
  let monthlyPayment = calculateMonthlyPayment({
    principal: Number(loan.principal),
    years: Number(loan.years),
    annualRatePct: Number(loan.rate),
    compounding: loan.compounding,
  });
  const monthlyRate = monthlyRateFromNominal(Number(loan.rate), loan.compounding);

  const startIdx = absMonthIndex(loan.startMonth, loan.startYear);
  const nominalMonths = Number(loan.years) * 12 || 0;

  const eventsByMonth = new Map<number, LoanEvent[]>();
  let maxEventYears = Number(loan.years) || 0;
  for (const ev of loan.events) {
    const list = eventsByMonth.get(ev.monthIndex) || [];
    list.push(ev);
    eventsByMonth.set(ev.monthIndex, list);
    if (ev.type === "changeAmortization") {
      const years = Number(ev.params.years);
      if (years > maxEventYears) maxEventYears = years;
    }
  }

  const schedule: ScheduleMonth[] = [];
  let balance = Number(loan.principal) || 0;
  let totalInterest = 0;
  let totalPaid = 0;
  let idx = startIdx;
  const safetyCap = Math.max(nominalMonths, maxEventYears * 12, 600); // support event-driven amortization extensions

  while (balance > 0.005 && idx - startIdx < safetyCap) {
    const monthEvents = eventsByMonth.get(idx) || [];

    let lumpSum = 0;
    for (const ev of monthEvents) {
      if (ev.type === "lumpSum") {
        const config = EVENT_TYPES[ev.type];
        if (config && config.apply) {
          lumpSum += config.apply(ev.params);
        }
      }
    }
    if (lumpSum > balance) {
      totalPaid += balance;
      balance = 0;
    } else {
      totalPaid += lumpSum;
      balance -= lumpSum;
    }

    for (const ev of monthEvents) {
      if (ev.type === "changeMonthlyPayment") {
        const amount = Number(ev.params.amount);
        if (amount > 0) {
          monthlyPayment = amount;
        }
      }
      if (ev.type === "changeAmortization") {
        const years = Number(ev.params.years);
        if (years > 0) {
          monthlyPayment = calculateMonthlyPayment({
            principal: balance,
            years: years,
            annualRatePct: Number(loan.rate),
            compounding: loan.compounding,
          });
        }
      }
    }

    const interest = balance * monthlyRate;
    let principalPaid = monthlyPayment - interest;
    if (principalPaid < 0) principalPaid = 0;
    if (principalPaid > balance) principalPaid = balance;

    balance = balance - principalPaid;
    if (balance < 0.005) balance = 0;

    const totalCash = interest + principalPaid;
    totalInterest += interest;
    totalPaid += totalCash;

    schedule.push({ idx, interest, principalPaid, lumpSum, totalCash, balance });
    idx++;
  }

  return { schedule, monthlyPayment, totalPaid, totalInterest, payoffIdx: idx };
}
