import { styles } from "../styles";

export interface FieldProps {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  prefix?: string;
  step?: number;
}

export function Field({ label, value, onChange, prefix, step }: FieldProps) {
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
