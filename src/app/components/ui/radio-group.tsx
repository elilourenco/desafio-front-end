"use client"

import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "../../lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);

const useRadioGroup = () => {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error("useRadioGroup must be used within a RadioGroup");
  }
  return context;
};

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

const RadioGroup = ({ 
  className, 
  value: controlledValue,
  defaultValue,
  onValueChange,
  name,
  disabled,
  children,
  ...props 
}: RadioGroupProps) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <RadioGroupContext.Provider value={{ value, onValueChange: handleValueChange, name, disabled }}>
      <div 
        className={cn("grid gap-2", className)} 
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string;
}

const RadioGroupItem = ({ 
  className, 
  value: itemValue,
  disabled: itemDisabled,
  id,
  ...props 
}: RadioGroupItemProps) => {
  const { value: groupValue, onValueChange, name, disabled: groupDisabled } = useRadioGroup();
  const isChecked = groupValue === itemValue;
  const isDisabled = itemDisabled || groupDisabled;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const generatedId = React.useId();
  const inputId = id || generatedId;

  const handleChange = () => {
    if (!isDisabled && onValueChange) {
      onValueChange(itemValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={inputRef}
        type="radio"
        id={inputId}
        name={name}
        value={itemValue}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background",
          "cursor-pointer transition-all",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "flex items-center justify-center",
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={isDisabled ? -1 : 0}
      >
        {isChecked && (
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        )}
      </label>
    </div>
  );
};

export { RadioGroup, RadioGroupItem };