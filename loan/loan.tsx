const { useState, useMemo } = React;

import { styles } from "./styles";

/* ------------------------------------------------------------------ */
/* finance                                                             */
/* ------------------------------------------------------------------ */

type Compounding = "monthly" | "semiannual";

function monthlyRateFromNominal(annualRatePct: number, compounding: Compounding): number {
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
  compounding?: Compounding;
}

function calculateMonthlyPayment({
  principal,
  years,
  annualRatePct,
  compounding = "monthly",
}: MonthlyPaymentInput): number {
  const P = Number(principal);
  const n = Number(years) * 12;
  const r = monthlyRateFromNominal(Number(annualRatePct), compounding);
  if (!P || !n) return 0;
  if (!r) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function formatCurrency(amount: number): string {
  return (amount || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ------------------------------------------------------------------ */
/* calendar helpers                                                     */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function absMonthIndex(month: number, year: number): number {
  return year * 12 + (month - 1);
}

function indexToLabel(idx: number, short = true): string {
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  const name = MONTH_NAMES[month - 1];
  return `${short ? name.slice(0, 3) : name} ${year}`;
}

/* ------------------------------------------------------------------ */
/* event system (extensible registry)                                  */
/* ------------------------------------------------------------------ */

interface LumpSumParams {
  amount: number | "";
}

interface EventTypeConfig<P = any> {
  label: string;
  defaultParams: () => P;
  /** Requested reduction to principal this event asks for (before clamping to remaining balance). */
  apply: (params: P) => number;
  Fields: (props: { params: P; onChange: (params: P) => void }) => JSX.Element;
}

function LumpSumFields({ params, onChange }: { params: LumpSumParams; onChange: (p: LumpSumParams) => void }) {
  return (
    <Field
      label="Lump sum amount"
      value={params.amount}
      onChange={(v) => onChange({ ...params, amount: v })}
      prefix="$"
      step={1000}
    />
  );
}

const EVENT_TYPES: Record<string, EventTypeConfig> = {
  lumpSum: {
    label: "Lump sum payment",
    defaultParams: () => ({ amount: 10000 }),
    apply: (params: LumpSumParams) => Number(params.amount) || 0,
    Fields: LumpSumFields,
  },
  // Add new event types here: rate change, skip payment, recast, etc.
};

interface LoanEvent {
  id: number;
  monthIndex: number;
  type: string; // key into EVENT_TYPES
  params: any;
}

let nextEventId = 1;
function makeDefaultEvent(monthIndex: number): LoanEvent {
  const type = "lumpSum";
  return { id: nextEventId++, monthIndex, type, params: EVENT_TYPES[type].defaultParams() };
}

/* ------------------------------------------------------------------ */
/* loan state                                                           */
/* ------------------------------------------------------------------ */

interface LoanState {
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
function makeDefaultLoan(): LoanState {
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

/* ------------------------------------------------------------------ */
/* month-by-month simulation                                           */
/* ------------------------------------------------------------------ */

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

function generateSchedule(loan: LoanState): ScheduleResult {
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

/* ------------------------------------------------------------------ */
/* components: Field, RadioGroup, RateField, StartField                */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  prefix?: string;
  step?: number;
}

function Field({ label, value, onChange, prefix, step }: FieldProps) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>{label}</label>
      <div style={styles.fieldBox}>
        {prefix && <span style={styles.fieldPrefix}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={styles.fieldInput}
        />
      </div>
    </div>
  );
}

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function RadioGroup<T extends string>({ name, options, value, onChange }: RadioGroupProps<T>) {
  return (
    <div style={styles.radioGroup}>
      {options.map((opt) => (
        <label key={opt.value} style={styles.radioOption}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={styles.radioInput}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

const COMPOUNDING_OPTIONS: RadioOption<Compounding>[] = [
  { value: "monthly", label: "Monthly" },
  { value: "semiannual", label: "Semi-annual" },
];

interface RateFieldProps {
  value: number | "";
  onChange: (value: number | "") => void;
  step?: number;
  compounding: Compounding;
  onCompoundingChange: (value: Compounding) => void;
}

function RateField({ value, onChange, step, compounding, onCompoundingChange }: RateFieldProps) {
  return (
    <div style={styles.fieldWrap}>
      <div style={styles.fieldLabelRow}>
        <label style={{ ...styles.fieldLabel, marginBottom: 0 }}>Interest rate (%)</label>
        <RadioGroup<Compounding>
          name="compounding"
          options={COMPOUNDING_OPTIONS}
          value={compounding}
          onChange={onCompoundingChange}
        />
      </div>
      <div style={styles.fieldBox}>
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={styles.fieldInput}
        />
      </div>
    </div>
  );
}

interface StartFieldProps {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

function StartField({ month, year, onMonthChange, onYearChange }: StartFieldProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>Start month</label>
      <div style={{ display: "flex", gap: 8 }}>
        <select value={month} onChange={(e) => onMonthChange(Number(e.target.value))} style={{ ...styles.fieldInput, flex: 2 }}>
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => onYearChange(Number(e.target.value))} style={{ ...styles.fieldInput, flex: 1 }}>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* events section                                                       */
/* ------------------------------------------------------------------ */

function EventsSection({ loan, onChange }: { loan: LoanState; onChange: (events: LoanEvent[]) => void }) {
  const startIdx = absMonthIndex(loan.startMonth, loan.startYear);
  const nominalMonths = Math.max(Number(loan.years) * 12 || 0, 1);
  const monthOptions = useMemo(
    () => Array.from({ length: nominalMonths }, (_, i) => ({ idx: startIdx + i, label: indexToLabel(startIdx + i, false) })),
    [startIdx, nominalMonths]
  );

  function addEvent() {
    onChange([...loan.events, makeDefaultEvent(monthOptions[0].idx)]);
  }
  function updateEvent(id: number, patch: Partial<LoanEvent>) {
    onChange(loan.events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function removeEvent(id: number) {
    onChange(loan.events.filter((e) => e.id !== id));
  }

  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>Events</label>
      {loan.events.length === 0 && (
        <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>No events yet.</div>
      )}
      {loan.events.map((ev) => {
        const config = EVENT_TYPES[ev.type];
        const Fields = config.Fields;
        return (
          <div
            key={ev.id}
            style={{
              padding: 10, marginBottom: 8, border: "1px solid #e5e7eb", borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ ...styles.fieldLabel, fontSize: 12 }}>Month</label>
                <select value={ev.monthIndex} onChange={(e) => updateEvent(ev.id, { monthIndex: Number(e.target.value) })} style={{ ...styles.fieldInput, background: "#fff" }}>
                  {monthOptions.map((opt) => (
                    <option key={opt.idx} value={opt.idx}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ ...styles.fieldLabel, fontSize: 12 }}>Type</label>
                <select
                  value={ev.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    updateEvent(ev.id, { type, params: EVENT_TYPES[type].defaultParams() });
                  }}
                  style={{ ...styles.fieldInput, background: "#fff" }}
                >
                  {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end", marginTop: 8 }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <Fields params={ev.params} onChange={(params) => updateEvent(ev.id, { params })} />
              </div>
              <button
                onClick={() => removeEvent(ev.id)}
                style={{ border: "none", background: "transparent", color: "#dc2626", cursor: "pointer", fontSize: 13 }}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      <button onClick={addEvent} style={{ padding: "6px 12px", borderRadius: 6, border: "1px dashed #999", background: "transparent", cursor: "pointer", fontSize: 14 }}>
        + Add event
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* payment summary                                                      */
/* ------------------------------------------------------------------ */

interface PaymentSummaryProps {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  payoffLabel: string;
}

function PaymentSummary({ monthlyPayment, totalPaid, totalInterest, payoffLabel }: PaymentSummaryProps) {
  return (
    <div style={styles.panel}>
      <div style={styles.eyebrowOnPanel}>Monthly Payment</div>
      <div style={styles.panelHeadline}>{formatCurrency(monthlyPayment)}</div>
      <div style={styles.panelRowFirst}>
        <span>Total paid</span>
        <span>{formatCurrency(totalPaid)}</span>
      </div>
      <div style={styles.panelRow}>
        <span>Total interest</span>
        <span>{formatCurrency(totalInterest)}</span>
      </div>
      <div style={styles.panelRow}>
        <span>Paid off</span>
        <span>{payoffLabel}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* loan panel                                                           */
/* ------------------------------------------------------------------ */

function LoanPanel({ loan, onUpdate }: { loan: LoanState; onUpdate: (patch: Partial<LoanState>) => void }) {
  const result = useMemo(() => generateSchedule(loan), [loan]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        background: "#fff",
      }}
    >
      <Field label="Principal (loan amount)" value={loan.principal} onChange={(v) => onUpdate({ principal: v })} prefix="$" step={1000} />
      <Field label="Amortization (years)" value={loan.years} onChange={(v) => onUpdate({ years: v })} step={1} />
      <RateField value={loan.rate} onChange={(v) => onUpdate({ rate: v })} step={0.05} compounding={loan.compounding} onCompoundingChange={(v) => onUpdate({ compounding: v })} />
      <StartField month={loan.startMonth} year={loan.startYear} onMonthChange={(m) => onUpdate({ startMonth: m })} onYearChange={(y) => onUpdate({ startYear: y })} />
      <EventsSection loan={loan} onChange={(events) => onUpdate({ events })} />
      <PaymentSummary
        monthlyPayment={result.monthlyPayment}
        totalPaid={result.totalPaid}
        totalInterest={result.totalInterest}
        payoffLabel={indexToLabel(result.payoffIdx, false)}
      />
    </div>
  );
}

const LOAN_COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

/* ------------------------------------------------------------------ */
/* tab bar + app                                                        */
/* ------------------------------------------------------------------ */

function TabBar({ loans, activeId, onSelect, onAdd, onClose }: {
  loans: LoanState[]; activeId: number; onSelect: (id: number) => void; onAdd: () => void; onClose: (id: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
      {loans.map((loan, i) => {
        const active = loan.id === activeId;
        return (
          <div key={loan.id} onClick={() => onSelect(loan.id)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, cursor: "pointer",
            background: active ? LOAN_COLORS[i % LOAN_COLORS.length] : "#e5e7eb", color: active ? "#fff" : "#111", fontSize: 14,
          }}>
            <span>Loan {i + 1}</span>
            {loans.length > 1 && (
              <span onClick={(e) => { e.stopPropagation(); onClose(loan.id); }} style={{ opacity: 0.7 }}>×</span>
            )}
          </div>
        );
      })}
      <button onClick={onAdd} style={{ padding: "6px 12px", borderRadius: 6, border: "1px dashed #999", background: "transparent", cursor: "pointer", fontSize: 14 }}>+</button>
    </div>
  );
}

function LoansApp() {
  const [loans, setLoans] = useState<LoanState[]>([makeDefaultLoan()]);
  const [activeId, setActiveId] = useState<number>(loans[0].id);

  function addLoan() {
    const loan = makeDefaultLoan();
    setLoans((prev) => [...prev, loan]);
    setActiveId(loan.id);
  }
  function closeLoan(id: number) {
    setLoans((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (id === activeId && next.length) setActiveId(next[0].id);
      return next;
    });
  }
  function updateLoan(id: number, patch: Partial<LoanState>) {
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  const activeLoan = loans.find((l) => l.id === activeId)!;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Loan Calculator</h1>
        <TabBar loans={loans} activeId={activeId} onSelect={setActiveId} onAdd={addLoan} onClose={closeLoan} />
        <LoanPanel loan={activeLoan} onUpdate={(patch) => updateLoan(activeLoan.id, patch)} />
      </div>
    </div>
  );
}

const container = document.getElementById("k3DW-apps-loan");
if (container) {
  ReactDOM.createRoot(container).render(<LoansApp />);
}