import { useState, type ChangeEvent } from "react";
import { styles } from "../styles";

export interface NumericBoxProps {
  value: number | "";
  onChange: (value: number) => void;
  prefix?: string;
}

const isPositiveNumber = (s: String): boolean => {
  if (s.trim() !== "") {
    let num = Number(s);
    return isFinite(num) && num >= 0;
  }
  return false;
};

export function NumericBox({ value, onChange, prefix }: NumericBoxProps) {
  const [text, setText] = useState(String(value));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newText : string = e.target.value;
    setText(newText); // always update the local text so the user can keep typing
    // if invalid, we simply don't call onChange
    if (isPositiveNumber(newText)) {
      onChange(Number(newText));
    }
  };

  return (
    <div style={isPositiveNumber(text) ? styles.fieldBox : styles.fieldBoxInvalid}>
      {prefix && <span style={styles.fieldPrefix}>{prefix}</span>}
      <input
        type="text"
        value={text}
        onChange={handleChange}
        style={styles.fieldInput}
      />
    </div>
  );
}

