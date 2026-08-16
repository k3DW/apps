import { ReactNode, Children } from "react";

type FlexDirection = "vertical" | "horizontal";

interface FullCenterProps {
  children: ReactNode;
  direction: FlexDirection;
}

interface CenterProps {
  children: ReactNode;
}

function Center({ children, direction }: FullCenterProps) {
  const childArray = Children.toArray(children);
  return (
    <div className={direction == "vertical" ? "vcenter_wrapper" : "hcenter_wrapper"}>
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

export function VCenter({ children }: CenterProps) {
  return (
    <Center direction="vertical">
      {children}
    </Center>
  )
}

export function HCenter({ children }: CenterProps) {
  return (
    <Center direction="horizontal">
      {children}
    </Center>
  )
}
