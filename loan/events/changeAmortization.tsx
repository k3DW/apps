import { EventTypeConfig } from "./_config";
import { LabeledNumericField } from "../components/LabeledNumericField";

interface ChangeAmortizationParams {
  years: number;
}

function ChangeAmortizationFields({ params, onChange }: { params: ChangeAmortizationParams; onChange: (p: ChangeAmortizationParams) => void }) {
  return (
    <LabeledNumericField
      label="New amortization (years)"
      value={params.years}
      onChange={(v: number) => onChange({ ...params, years: v })}
    />
  );
}

export const changeAmortization: EventTypeConfig<ChangeAmortizationParams> = {
  label: "Change amortization",
  defaultParams: () => ({ years: 15 }),
  apply: () => 0,
  Fields: ChangeAmortizationFields,
};
