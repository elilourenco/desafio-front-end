'use client';

import { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ 
  className, 
  checked,
  onCheckedChange,
  disabled,
  ...props 
}: CheckboxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    onCheckedChange?.(isChecked);
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary",
          "bg-background ring-offset-background",
          "checked:bg-primary checked:text-primary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none",
          className
        )}
        {...props}
      />
      <div className={cn(
        "absolute inset-0 flex items-center justify-center text-current",
        "op-0 peer-checked:opacity-100 transition-opacity",
        "pointer-events-none"
      )}>
        <Check className="h-3 w-3" />
      </div>
    </label>
  );
}

export { Checkbox };