import { ReactNode, Children } from "react";

type FlexDirection = "vertical" | "horizontal";

interface FullCenterProps {
  children: ReactNode;
  direction: FlexDirection;
  gap?: number;
}

interface CenterProps {
  children: ReactNode;
  gap?: number;
}

function Center({ children, direction, gap }: FullCenterProps) {
  const childArray = Children.toArray(children);
  const optionalStyle = gap ? { gap: gap! } : {};
  return (
    <div className={direction == "vertical" ? "vcenter_wrapper" : "hcenter_wrapper"} style={{ ...optionalStyle }}>
      <div className="center_flex_stretch"></div>
      {childArray.map((child, index) => (
        <div key={index} className="center_flex_fixed">
          {child}
        </div>
      ))}
      <div className="center_flex_stretch"></div>
    </div>
  );
}

export function VCenter({ children, gap }: CenterProps) {
  return (
    <Center direction="vertical" gap={gap}>
      {children}
    </Center>
  )
}

export function HCenter({ children, gap }: CenterProps) {
  return (
    <Center direction="horizontal" gap={gap}>
      {children}
    </Center>
  )
}
