import { styles } from "../styles";
import { formatCurrency } from "../finance";

interface PaymentSummaryProps {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  payoffLabel: string;
}

export function PaymentSummary({ monthlyPayment, totalPaid, totalInterest, payoffLabel }: PaymentSummaryProps) {
  return (
    <div style={styles.panel}>
      <div style={styles.eyebrowOnPanel}>Monthly Payment</div>
      <div style={styles.panelHeadline}>{formatCurrency(monthlyPayment)}</div>
      <div style={styles.panelRowFirst}>
        <span>Total paid</span>
        <span>{formatCurrency(totalPaid)}</span>
      </div>
      <div style={styles.panelRow}>
        <span>Total interest</span>
        <span>{formatCurrency(totalInterest)}</span>
      </div>
      <div style={styles.panelRow}>
        <span>Paid off</span>
        <span>{payoffLabel}</span>
      </div>
    </div>
  );
}
