import "./components.css";
import { styles } from "../styles";
import { MONTH_NAMES } from "../calendar";
import { HFlexBox } from "./FlexBox";

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
    <div>
      <label className="field_label">Start month</label>
      <div className="dropdown_field">
        <HFlexBox flexValues={[5, 3]}>
          <select className="dropdown_field_input" value={month} onChange={(e) => onMonthChange(Number(e.target.value))}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
          <select className="dropdown_field_input" value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </HFlexBox>
      </div>
    </div>
  );
}
