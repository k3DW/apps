declare global {
  const React: typeof import("react");
  const ReactDOM: typeof import("react-dom/client");

  export import JSX = React.JSX;
}
export {};
