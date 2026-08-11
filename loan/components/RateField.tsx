import { RadioGroup, RadioOption } from "./RadioGroup";
import { Compounding } from "../finance";
import { styles } from "../styles";

const COMPOUNDING_OPTIONS: RadioOption<Compounding>[] = [
  { value: "monthly", label: "Monthly" },
  { value: "semiannual", label: "Semi-annual" },
];

export interface RateFieldProps {
  value: number | "";
  onChange: (value: number | "") => void;
  step?: number;
  compounding: Compounding;
  onCompoundingChange: (value: Compounding) => void;
}

export function RateField({ value, onChange, step, compounding, onCompoundingChange }: RateFieldProps) {
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
