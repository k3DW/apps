import { EventTypeConfig } from "./_config";
import { Field } from "../components/Field";

interface ChangeMonthlyPaymentParams {
  amount: number | "";
}

function ChangeMonthlyPaymentFields({ params, onChange }: { params: ChangeMonthlyPaymentParams; onChange: (p: ChangeMonthlyPaymentParams) => void }) {
  return (
    <Field
      label="New monthly payment"
      value={params.amount}
      onChange={(v) => onChange({ ...params, amount: v })}
      prefix="$"
      step={50}
    />
  );
}

export const changeMonthlyPayment: EventTypeConfig<ChangeMonthlyPaymentParams> = {
  label: "Change monthly payment",
  defaultParams: () => ({ amount: 1500 }),
  apply: () => 0,
  Fields: ChangeMonthlyPaymentFields,
};
