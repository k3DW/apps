import { EventTypeConfig } from "./_config";
import { LabeledNumericField } from "../components/LabeledNumericField";

interface LumpSumParams {
  amount: number;
}

function LumpSumFields({ params, onChange }: { params: LumpSumParams; onChange: (p: LumpSumParams) => void }) {
  return (
    <LabeledNumericField
      label="Lump sum amount"
      value={params.amount}
      onChange={(v: number) => onChange({ ...params, amount: v })}
      prefix="$"
    />
  );
}

export const lumpSum: EventTypeConfig = {
  label: "Lump sum payment",
  defaultParams: () => ({ amount: 10000 }),
  apply: (params: LumpSumParams) => Number(params.amount) || 0,
  Fields: LumpSumFields,
};
