"use client"
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

const Label = ({ className, ...props }: LabelProps) => {
  return (
    <label
      className={cn(labelVariants(), className)}
      {...props}
    />
  );
};

Label.displayName = "Label";

export { Label };
