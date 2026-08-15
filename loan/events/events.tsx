import { useState, useMemo } from 'react';

import { lumpSum } from "./lumpSum";
import { changeMonthlyPayment } from "./changeMonthlyPayment";
import { changeAmortization } from "./changeAmortization";
import { EventTypeConfig } from "./_config";
import { LoanState } from "../state";
import { absMonthIndex, indexToLabel } from "../calendar";
import { styles } from "../styles";

export const EVENT_TYPES: Record<string, EventTypeConfig> = {
  lumpSum: lumpSum,
  changeMonthlyPayment: changeMonthlyPayment,
  changeAmortization: changeAmortization,
};

export interface LoanEvent {
  id: number;
  monthIndex: number;
  type: string;
  params: any;
};

let nextEventId = 1;
function makeDefaultEvent(monthIndex: number): LoanEvent {
  const type = "lumpSum";
  return { id: nextEventId++, monthIndex, type, params: EVENT_TYPES[type].defaultParams() };
}

export function EventsSection({ loan, onChange }: { loan: LoanState; onChange: (events: LoanEvent[]) => void }) {
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
    <div>
      <label className="field_label">Events</label>
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
              <div style={{ flex: 1, minWidth: 165 }}>
                <label className="field_label">Month</label>
                <select value={ev.monthIndex} onChange={(e) => updateEvent(ev.id, { monthIndex: Number(e.target.value) })} style={{ ...styles.fieldInput, background: "#fff" }}>
                  {monthOptions.map((opt) => (
                    <option key={opt.idx} value={opt.idx}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label className="field_label">Type</label>
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

