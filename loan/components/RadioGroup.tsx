import { styles } from "../styles";
import { VCenter } from "./Center";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

export interface RadioGroupProps<T extends string> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({ name, options, value, onChange }: RadioGroupProps<T>) {
  return (
    <VCenter>
      {options.map((opt) => (
        <label key={opt.value} className="radio_option">
          <input
            className="radio_input"
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </VCenter>
  );
}
