import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ToggleProps 
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = ({ 
  className, 
  variant, 
  size, 
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  disabled,
  ...props 
}: ToggleProps) => {
  const [internalPressed, setInternalPressed] = React.useState(defaultPressed);
  const isControlled = controlledPressed !== undefined;
  const pressed = isControlled ? controlledPressed : internalPressed;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newPressed = !pressed;
    
    if (!isControlled) {
      setInternalPressed(newPressed);
    }
    
    onPressedChange?.(newPressed);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      role="button"
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        toggleVariants({ variant, size }),
        pressed && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  );
};

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };