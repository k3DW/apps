import "./components.css";
import { useState, useEffect, type ChangeEvent } from "react";

interface NumericFieldProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}

const isPositiveNumber = (s: String): boolean => {
  if (s.trim() !== "") {
    let num = Number(s);
    return isFinite(num) && num >= 0;
  }
  return false;
};

export function NumericField({ value, onChange, prefix, suffix }: NumericFieldProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newText : string = e.target.value;
    setText(newText); // always update the local text so the user can keep typing
    // if invalid, we simply don't call onChange
    if (isPositiveNumber(newText)) {
      onChange(Number(newText));
    }
  };

  return (
    <div className={isPositiveNumber(text) ? "numeric_field" : "numeric_field invalid"}>
      {prefix && <span className="numeric_field_prefix">{prefix}</span>}
      <input
        type="text"
        value={text}
        onChange={handleChange}
        className="numeric_field_input"
      />
      {suffix && <span className="numeric_field_suffix">{suffix}</span>}
    </div>
  );
}

