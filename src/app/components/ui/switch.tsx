'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Switch Component
interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  thumbClassName?: string;
  required?: boolean;
  name?: string;
  value?: string;
}

function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  className,
  thumbClassName,
  required,
  name,
  value,
  ...props
}: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with controlled prop
  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;

    const newChecked = !isChecked;
    
    if (checked === undefined) {
      setIsChecked(newChecked);
    }
    
    onCheckedChange?.(newChecked);
    
    // Trigger change event on hidden input for form submission
    if (inputRef.current) {
      const event = new Event('change', { bubbles: true });
      inputRef.current.dispatchEvent(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <>
      {/* Hidden input for form submission */}
      <input
        ref={inputRef}
        type="checkbox"
        checked={isChecked}
        onChange={() => {}} // Handled by our toggle
        className="sr-only"
        required={required}
        name={name}
        value={value}
        aria-hidden="true"
        tabIndex={-1}
      />
      
      {/* Visual Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          // States
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Hover effects
          "hover:data-[state=checked]:bg-primary/90 hover:data-[state=unchecked]:bg-input/80",
          className
        )}
        data-state={isChecked ? 'checked' : 'unchecked'}
        {...props}
      >
        <span
          className={cn(
            // Base styles
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0",
            "transition-transform duration-200 ease-in-out",
            // Position based on state
            "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
            thumbClassName
          )}
          data-state={isChecked ? 'checked' : 'unchecked'}
        />
      </button>
    </>
  );
}

// Switch with Label Component
interface SwitchWithLabelProps extends SwitchProps {
  label: string;
  description?: string;
  labelPosition?: 'left' | 'right';
}

function SwitchWithLabel({
  label,
  description,
  labelPosition = 'right',
  ...switchProps
}: SwitchWithLabelProps) {
  return (
    <div className="flex items-center gap-3">
      {labelPosition === 'left' && (
        <div className="flex flex-col">
          <label 
            className="text-sm font-medium leading-none cursor-pointer"
            onClick={() => !switchProps.disabled && switchProps.onCheckedChange?.(!switchProps.checked)}
          >
            {label}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      
      <Switch {...switchProps} />
      
      {labelPosition === 'right' && (
        <div className="flex flex-col">
          <label 
            className="text-sm font-medium leading-none cursor-pointer"
            onClick={() => !switchProps.disabled && switchProps.onCheckedChange?.(!switchProps.checked)}
          >
            {label}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Switch Group Component
interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

function SwitchGroup({ children, className, label }: SwitchGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <h3 className="text-sm font-medium text-foreground mb-2">{label}</h3>
      )}
      {children}
    </div>
  );
}

// Hook for using switch state
function useSwitchState(defaultChecked = false) {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  return {
    isChecked,
    setIsChecked,
    onCheckedChange: setIsChecked,
    // Helper methods
    toggle: () => setIsChecked(!isChecked),
    setOn: () => setIsChecked(true),
    setOff: () => setIsChecked(false),
  };
}

export { Switch, SwitchWithLabel, SwitchGroup, useSwitchState };