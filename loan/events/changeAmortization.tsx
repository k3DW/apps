import { EventTypeConfig } from "./_config";
import { Field } from "../components/Field";

interface ChangeAmortizationParams {
  years: number | "";
}

function ChangeAmortizationFields({ params, onChange }: { params: ChangeAmortizationParams; onChange: (p: ChangeAmortizationParams) => void }) {
  return (
    <Field
      label="New amortization (years)"
      value={params.years}
      onChange={(v) => onChange({ ...params, years: v })}
    />
  );
}

export const changeAmortization: EventTypeConfig<ChangeAmortizationParams> = {
  label: "Change amortization",
  defaultParams: () => ({ years: 15 }),
  apply: () => 0,
  Fields: ChangeAmortizationFields,
};
