import { Compounding } from "./finance";
import { LoanEvent } from "./events/events";

export interface LoanState {
  id: number;
  principal: number | "";
  years: number | "";
  rate: number | "";
  compounding: Compounding;
  startMonth: number; // 1-12
  startYear: number;
  events: LoanEvent[];
}

let nextId = 1;
export function makeDefaultLoan(): LoanState {
  const now = new Date();
  return {
    id: nextId++,
    principal: 100000,
    years: 25,
    rate: 5,
    compounding: "monthly",
    startMonth: now.getMonth() + 1,
    startYear: now.getFullYear(),
    events: [],
  };
}
