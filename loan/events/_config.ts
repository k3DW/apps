export interface EventTypeConfig<P = any> {
  label: string;
  defaultParams: () => P;
  apply: (params: P) => number;
  Fields: (props: { params: P; onChange: (params: P) => void }) => JSX.Element;
}
