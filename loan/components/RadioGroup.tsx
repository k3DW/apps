import { styles } from "../styles";

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
    <div style={styles.radioGroup}>
      {options.map((opt) => (
        <label key={opt.value} style={styles.radioOption}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={styles.radioInput}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
