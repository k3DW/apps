import "./components.css";
import { NumericField } from "./NumericField";

interface LabeledNumericFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}

export function LabeledNumericField({ label, value, onChange, prefix }: LabeledNumericFieldProps) {
  return (
    <div className="field_wrapper">
      <label className="field_label">{label}</label>
      <NumericField value={value} onChange={onChange} prefix={prefix} />
    </div>
  );
}
