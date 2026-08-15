import "./components.css";
import { styles } from "../styles";
import { MONTH_NAMES } from "../calendar";

export interface StartFieldProps {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

export function StartField({ month, year, onMonthChange, onYearChange }: StartFieldProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="field_wrapper">
      <label className="field_label">Start month</label>
      <div className="date_dropdown_field" style={{ display: "flex", gap: 8 }}>
        <select value={month} onChange={(e) => onMonthChange(Number(e.target.value))} style={{ ...styles.fieldInput, flex: 5 }}>
          {MONTH_NAMES.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => onYearChange(Number(e.target.value))} style={{ ...styles.fieldInput, flex: 3 }}>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
