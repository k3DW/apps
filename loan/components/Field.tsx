import { styles } from "../styles";
import { NumericField } from "./NumericField";

export interface FieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}

export function Field({ label, value, onChange, prefix }: FieldProps) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.fieldLabel}>{label}</label>
      <NumericField value={value} onChange={onChange} prefix={prefix} />
    </div>
  );
}
