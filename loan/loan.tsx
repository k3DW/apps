const { useState, useMemo } = React;

import { styles } from "./styles";

/* ------------------------------------------------------------------ */
/*  finance                                                             */
/* ------------------------------------------------------------------ */
type Compounding = "monthly" | "semiannual";

interface MonthlyPaymentInput {
  principal: number;
  years: number;
  annualRatePct: number;
  compounding?: Compounding;
}

function monthlyRateFromNominal(annualRatePct: number, compounding: Compounding): number {
  const annual = annualRatePct / 100;
  if (compounding === "semiannual") {
    const semiAnnualRate = annual / 2;
    return Math.pow(1 + semiAnnualRate, 2 / 12) - 1;
  }
  return annual / 12;
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
/*  components                                                         */
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

interface PaymentSummaryProps {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
}

function PaymentSummary({ monthlyPayment, totalPaid, totalInterest }: PaymentSummaryProps) {
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
    </div>
  );
}

function LoanCalculator() {
  const [principal, setPrincipal] = useState<number | "">(100000);
  const [years, setYears] = useState<number | "">(25);
  const [rate, setRate] = useState<number | "">(5);
  const [compounding, setCompounding] = useState<Compounding>("monthly");

  const monthlyPayment = useMemo(
    () =>
      calculateMonthlyPayment({
        principal: Number(principal),
        years: Number(years),
        annualRatePct: Number(rate),
        compounding,
      }),
    [principal, years, rate, compounding]
  );

  const totalPaid = monthlyPayment * Number(years) * 12;
  const totalInterest = totalPaid - Number(principal);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Loan Calculator</h1>

        <Field label="Principal (loan amount)" value={principal} onChange={setPrincipal} prefix="$" step={1000} />
        <Field label="Amortization (years)" value={years} onChange={setYears} step={1} />
        <RateField
          value={rate}
          onChange={setRate}
          step={0.05}
          compounding={compounding}
          onCompoundingChange={setCompounding}
        />

        <PaymentSummary
          monthlyPayment={monthlyPayment}
          totalPaid={totalPaid}
          totalInterest={totalInterest}
        />
      </div>
    </div>
  );
}

/* Mount directly — no export, since nothing imports this file. */
const container = document.getElementById("k3DW-apps-loan");
if (container) {
  ReactDOM.createRoot(container).render(<LoanCalculator />);
}
