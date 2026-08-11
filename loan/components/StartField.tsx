import { MONTH_NAMES } from "../calendar";
import { styles } from "../styles";

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
