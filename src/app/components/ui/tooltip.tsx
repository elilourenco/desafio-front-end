"use client"

import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  delayDuration: number;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(undefined);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within TooltipProvider");
  }
  return context;
};

interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

const TooltipProvider = ({ 
  children, 
  delayDuration = 700,
  skipDelayDuration = 300 
}: TooltipProviderProps) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}

const Tooltip = ({ 
  children, 
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 700
}: TooltipProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = React.useCallback((newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [isControlled, onOpenChange]);

  const value = React.useMemo(
    () => ({ open, setOpen, delayDuration }),
    [open, setOpen, delayDuration]
  );

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
};

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const TooltipTrigger = ({ 
  children, 
  asChild,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props 
}: TooltipTriggerProps) => {
  const { setOpen, delayDuration } = useTooltip();
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, delayDuration);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(false);
    onMouseLeave?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    setOpen(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    setOpen(false);
    onBlur?.(e);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    });
  }

  return (
    <button
      type="button"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </button>
  );
};

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

const TooltipContent = ({ 
  className, 
  sideOffset = 4, 
  side = "top",
  align = "center",
  children,
  ...props 
}: TooltipContentProps) => {
  const { open } = useTooltip();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const timeout = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!mounted) return null;

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const animationClasses = open
    ? "animate-in fade-in-0 zoom-in-95"
    : "animate-out fade-out-0 zoom-out-95";

  return (
    <div className="relative inline-block">
      <div
        role="tooltip"
        className={cn(
          "absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          sideClasses[side],
          animationClasses,
          className
        )}
        style={{
          marginTop: side === "bottom" ? `${sideOffset}px` : undefined,
          marginBottom: side === "top" ? `${sideOffset}px` : undefined,
          marginLeft: side === "right" ? `${sideOffset}px` : undefined,
          marginRight: side === "left" ? `${sideOffset}px` : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

TooltipProvider.displayName = "TooltipProvider";
Tooltip.displayName = "Tooltip";
TooltipTrigger.displayName = "TooltipTrigger";
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };