import { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

import { styles } from "./styles";
import "./theme.css"

import { indexToLabel } from "./calendar";

import { EventsSection } from "./events/events"

import { LabeledNumericField } from "./components/LabeledNumericField";
import { RateField } from "./components/RateField";
import { StartField } from "./components/StartField";
import { PaymentSummary } from "./components/PaymentSummary";

import { LoanState, makeDefaultLoan } from "./state";
import { generateSchedule, ScheduleResult } from "./schedule";

/* ------------------------------------------------------------------ */
/* loan panel                                                           */
/* ------------------------------------------------------------------ */

function LoanPanel({ loan, onUpdate }: { loan: LoanState; onUpdate: (patch: Partial<LoanState>) => void }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        background: "#fff",
      }}
    >
      <LabeledNumericField label="Principal (loan amount)" value={loan.principal} onChange={(v: number) => onUpdate({ principal: v })} prefix="$" />
      <LabeledNumericField label="Amortization (years)" value={loan.years} onChange={(v: number) => onUpdate({ years: v })} />
      <RateField value={loan.rate} onChange={(v: number) => onUpdate({ rate: v })} compounding={loan.compounding} onCompoundingChange={(v) => onUpdate({ compounding: v })} />
      <StartField month={loan.startMonth} year={loan.startYear} onMonthChange={(m: number) => onUpdate({ startMonth: m })} onYearChange={(y) => onUpdate({ startYear: y })} />
      <EventsSection loan={loan} onChange={(events) => onUpdate({ events })} />
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

  const activeLoan: LoanState = loans.find((l) => l.id === activeId)!;
  const activeSchedule: ScheduleResult = useMemo(() => generateSchedule(activeLoan), [activeLoan]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Loan Calculator</h1>
        <TabBar loans={loans} activeId={activeId} onSelect={setActiveId} onAdd={addLoan} onClose={closeLoan} />
        <LoanPanel loan={activeLoan} onUpdate={(patch) => updateLoan(activeLoan.id, patch)} />
        <PaymentSummary
          monthlyPayment={activeSchedule.monthlyPayment}
          totalPaid={activeSchedule.totalPaid}
          totalInterest={activeSchedule.totalInterest}
          payoffLabel={indexToLabel(activeSchedule.payoffIdx, false)}
        />
      </div>
    </div>
  );
}

const container = document.getElementById("k3DW-apps-loan");
if (container) {
  ReactDOM.createRoot(container).render(<LoansApp />);
}