import "./components.css";
import { RadioGroup, RadioOption } from "./RadioGroup";
import { Compounding } from "../finance";
import { NumericField } from "./NumericField";
import { HFlexBox } from "./FlexBox";

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
    <div>
      <label className="field_label">Interest</label>
      <HFlexBox flexValues={[1, 2]}>
        <NumericField value={value} onChange={onChange} suffix="%" />
        <RadioGroup<Compounding>
          name="compounding"
          options={COMPOUNDING_OPTIONS}
          value={compounding}
          onChange={onCompoundingChange}
        />
      </HFlexBox>
    </div>
  );
}
