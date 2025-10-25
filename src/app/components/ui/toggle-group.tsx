"use client"

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "../ui/toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  defaultValue?: string | string[];
  disabled?: boolean;
}

const ToggleGroup = ({ 
  className, 
  variant, 
  size, 
  children, 
  type = "single",
  value: controlledValue,
  onValueChange,
  defaultValue,
  disabled = false,
  ...props 
}: ToggleGroupProps) => {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultValue || (type === "multiple" ? [] : "")
  );

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleToggle = React.useCallback((itemValue: string) => {
    if (disabled) return;

    let newValue: string | string[];

    if (type === "multiple") {
      const currentArray = Array.isArray(value) ? value : [];
      newValue = currentArray.includes(itemValue)
        ? currentArray.filter(v => v !== itemValue)
        : [...currentArray, itemValue];
    } else {
      newValue = value === itemValue ? "" : itemValue;
    }

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  }, [value, type, disabled, controlledValue, onValueChange]);

  const contextValue = React.useMemo(
    () => ({ variant, size, value, onToggle: handleToggle, disabled }),
    [variant, size, value, handleToggle, disabled]
  );

  return (
    <div className={cn("flex items-center justify-center gap-1", className)} {...props}>
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </div>
  );
};

ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof toggleVariants> {
  value: string;
}

const ToggleGroupItem = ({ 
  className, 
  children, 
  variant, 
  size, 
  value: itemValue,
  disabled: itemDisabled,
  ...props 
}: ToggleGroupItemProps) => {
  const context = React.useContext(ToggleGroupContext) as any;
  
  const isPressed = React.useMemo(() => {
    if (Array.isArray(context.value)) {
      return context.value.includes(itemValue);
    }
    return context.value === itemValue;
  }, [context.value, itemValue]);

  const disabled = itemDisabled || context.disabled;

  const handleClick = () => {
    if (!disabled && context.onToggle) {
      context.onToggle(itemValue);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isPressed}
      data-state={isPressed ? "on" : "off"}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };