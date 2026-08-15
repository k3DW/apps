import "./components.css";
import { RadioGroup, RadioOption } from "./RadioGroup";
import { Compounding } from "../finance";
import { NumericField } from "./NumericField";

const COMPOUNDING_OPTIONS: RadioOption<Compounding>[] = [
  { value: "monthly", label: "Compounded monthly" },
  { value: "semi-annually", label: "Compounded semi-annually" },
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
      <label className="field_label">Interest</label>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <NumericField value={value} onChange={onChange} suffix="%" />
        </div>
        <div style={{ flex: 2 }}>
          <RadioGroup<Compounding>
            name="compounding"
            options={COMPOUNDING_OPTIONS}
            value={compounding}
            onChange={onCompoundingChange}
          />
        </div>
      </div>
    </div>
  );
}
