import { RadioGroup, RadioOption } from "./RadioGroup";
import { Compounding } from "../finance";
import { styles } from "../styles";
import { NumericBox } from "./NumericBox";

const COMPOUNDING_OPTIONS: RadioOption<Compounding>[] = [
  { value: "monthly", label: "Monthly" },
  { value: "semiannual", label: "Semi-annual" },
];

export interface RateFieldProps {
  value: number | "";
  onChange: (value: number | "") => void;
  compounding: Compounding;
  onCompoundingChange: (value: Compounding) => void;
}

export function RateField({ value, onChange, compounding, onCompoundingChange }: RateFieldProps) {
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
      <NumericBox value={value} onChange={onChange} />
    </div>
  );
}
