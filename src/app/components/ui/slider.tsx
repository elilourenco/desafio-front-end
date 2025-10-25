import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
}

const Slider = ({ 
  min = 0, 
  max = 100, 
  step = 1, 
  value: controlledValue,
  defaultValue = [50],
  onValueChange,
  className,
  disabled,
  ...props 
}: SliderProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue[0]);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue[0] : internalValue;
  
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onValueChange?.([newValue]);
  };

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div 
          className="absolute h-full bg-primary transition-all" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      
      <div 
        className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
};

Slider.displayName = "Slider";

export { Slider };