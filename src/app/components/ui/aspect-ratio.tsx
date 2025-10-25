"use client"
import * as React from "react";
import { cn } from "../../lib/utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number;
  ref?: React.Ref<HTMLDivElement>;
}

const AspectRatio = ({ ratio = 1, className, children, ref, style, ...props }: AspectRatioProps) => (
  <div
    ref={ref}
    className={cn("relative w-full", className)}
    style={{
      paddingBottom: `${100 / ratio}%`,
      ...style,
    }}
    {...props}
  >
    <div className="absolute inset-0">
      {children}
    </div>
  </div>
);

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };