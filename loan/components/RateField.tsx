import "./components.css";
import { RadioGroup, RadioOption } from "./RadioGroup";
import { Compounding } from "../finance";
import { NumericField } from "./NumericField";

const COMPOUNDING_OPTIONS: RadioOption<Compounding>[] = [
  { value: "monthly", label: "Monthly" },
  { value: "semiannual", label: "Semi-annual" },
];

export interface RateFieldProps {
  value: number;
  onChange: (value: number) => void;
  compounding: Compounding;
  onCompoundingChange: (value: Compounding) => void;
}

export function RateField({ value, onChange, compounding, onCompoundingChange }: RateFieldProps) {
  return (
    <div className="field_wrapper">
      <div className="field_label_row_wrapper">
        <label className="field_label in_row">Interest rate (%)</label>
        <RadioGroup<Compounding>
          name="compounding"
          options={COMPOUNDING_OPTIONS}
          value={compounding}
          onChange={onCompoundingChange}
        />
      </div>
      <NumericField value={value} onChange={onChange} />
    </div>
  );
}
