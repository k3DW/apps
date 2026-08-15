import { styles } from "../styles";
import { NumericField } from "./NumericField";

interface LabeledNumericFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}

export function LabeledNumericField({ label, value, onChange, prefix }: LabeledNumericFieldProps) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>{label}</label>
      <NumericField value={value} onChange={onChange} prefix={prefix} />
    </div>
  );
}
