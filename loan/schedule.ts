import { calculateMonthlyPayment, monthlyRateFromNominal } from "./finance";
import { absMonthIndex } from "./calendar";
import { LoanState } from "./state";
import { LoanEvent, EVENT_TYPES } from "./events/events";

interface ScheduleMonth {
  idx: number;
  interestPaid: number;
  principalPaid: number;
  lumpSum: number;
  payment: number;
  balance: number;
}

export interface ScheduleResult {
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

  const maxMonths = 12 * 100;
  while (balance > 0.005 && idx - startIdx < maxMonths) {
    const monthEvents = eventsByMonth.get(idx) || [];

    let lumpSum = 0;
    for (const ev of monthEvents) {
      if (ev.type === "lumpSum") {
        const config = EVENT_TYPES[ev.type];
        if (config && config.apply) {
          lumpSum += config.apply(ev.params);
        }
      } else if (ev.type === "changeMonthlyPayment") {
        const amount = Number(ev.params.amount);
        if (amount > 0) {
          monthlyPayment = amount;
        }
      } else if (ev.type === "changeAmortization") {
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
    if (lumpSum > balance) {
      totalPaid += balance;
      balance = 0;
    } else {
      totalPaid += lumpSum;
      balance -= lumpSum;
    }

    const interestPaid = balance * monthlyRate;
    let principalPaid = monthlyPayment - interestPaid;
    if (principalPaid > balance) {
      principalPaid = balance;
    }

    balance -= principalPaid;
    if (balance < 0.005) {
      principalPaid -= balance;
      balance = 0;
    }

    const payment = interestPaid + principalPaid;
    totalInterest += interestPaid;
    totalPaid += payment;

    schedule.push({ idx, interestPaid, principalPaid, lumpSum, payment, balance });
    idx++;
  }

  return { schedule, monthlyPayment, totalPaid, totalInterest, payoffIdx: idx };
}
