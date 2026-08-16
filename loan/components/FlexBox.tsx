import { ReactNode, Children } from "react";

type FlexDirection = "vertical" | "horizontal";

interface FullFlexBoxProps {
  children: ReactNode;
  flexValues: number[];
  direction: FlexDirection;
}

interface FlexBoxProps {
  children: ReactNode;
  flexValues: number[];
}

function FlexBox({ children, flexValues, direction }: FullFlexBoxProps) {
  const childArray = Children.toArray(children);
  if (childArray.length !== flexValues.length) {
    throw new Error(
      `FlexBox: expected ${childArray.length} flex values (one per child) but got ${flexValues.length}.`
    );
  }
  return (
    <div className={direction == "vertical" ? "vflexbox_wrapper" : "hflexbox_wrapper"}>
      {childArray.map((child, index) => (
        <div key={index} style={{ flex: flexValues[index] }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function VFlexBox({ children, flexValues }: FlexBoxProps) {
  return(
    <FlexBox flexValues={flexValues} direction="vertical">
      {children}
    </FlexBox>
  );
}

export function HFlexBox({ children, flexValues }: FlexBoxProps) {
  return(
    <FlexBox flexValues={flexValues} direction="horizontal">
      {children}
    </FlexBox>
  );
}
