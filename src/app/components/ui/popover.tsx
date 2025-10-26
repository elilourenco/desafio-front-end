"use client"
import * as React from "react";
import { cn } from "../../lib/utils";
import { createPortal } from "react-dom";

// Context para controlar o estado do popover
interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within Popover");
  }
  return context;
};

// Popover Root
interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function Popover({ 
  children, 
  open: controlledOpen, 
  onOpenChange,
  defaultOpen = false 
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Determina se é controlado ou não controlado
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = React.useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef, contentRef }}>
      {children}
    </PopoverContext.Provider>
  );
}

// PopoverTrigger
interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function PopoverTrigger({ 
  className, 
  children, 
  asChild = false,
  ...props 
}: PopoverTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = usePopover();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Se asChild é true, clona o child e adiciona as props
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        handleClick();
        (children as any).props?.onClick?.(e);
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        handleKeyDown(e);
        (children as any).props?.onKeyDown?.(e);
      },
      "aria-expanded": isOpen,
      "aria-haspopup": "dialog",
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      type="button"
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      {...props}
    >
      {children}
    </button>
  );
}

// PopoverContent
interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
}

export function PopoverContent({
  className,
  children,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  avoidCollisions = true,
  ...props
}: PopoverContentProps) {
  const { isOpen, setIsOpen, triggerRef, contentRef } = usePopover();
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Calcula a posição do popover
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Calcula posição baseada no side
    switch (side) {
      case "top":
        top = triggerRect.top - (contentRect?.height || 0) - sideOffset;
        break;
      case "bottom":
        top = triggerRect.bottom + sideOffset;
        break;
      case "left":
        left = triggerRect.left - (contentRect?.width || 0) - sideOffset;
        top = triggerRect.top;
        break;
      case "right":
        left = triggerRect.right + sideOffset;
        top = triggerRect.top;
        break;
    }

    // Calcula alinhamento
    if (side === "top" || side === "bottom") {
      switch (align) {
        case "start":
          left = triggerRect.left + alignOffset;
          break;
        case "center":
          left = triggerRect.left + triggerRect.width / 2 - (contentRect?.width || 0) / 2 + alignOffset;
          break;
        case "end":
          left = triggerRect.right - (contentRect?.width || 0) + alignOffset;
          break;
      }
    } else {
      switch (align) {
        case "start":
          top = triggerRect.top + alignOffset;
          break;
        case "center":
          top = triggerRect.top + triggerRect.height / 2 - (contentRect?.height || 0) / 2 + alignOffset;
          break;
        case "end":
          top = triggerRect.bottom - (contentRect?.height || 0) + alignOffset;
          break;
      }
    }

    // Evita colisões com viewport
    if (avoidCollisions && contentRect) {
      if (left + contentRect.width > viewportWidth) {
        left = viewportWidth - contentRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }
      if (top + contentRect.height > viewportHeight) {
        top = viewportHeight - contentRect.height - 8;
      }
      if (top < 8) {
        top = 8;
      }
    }

    setPosition({ top, left });
  }, [side, align, sideOffset, alignOffset, avoidCollisions]);

  // Atualiza posição quando abre
  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Pequeno delay para garantir que o DOM está montado
      requestAnimationFrame(() => {
        calculatePosition();
      });

      // Recalcula ao redimensionar
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition, true);

      return () => {
        window.removeEventListener("resize", calculatePosition);
        window.removeEventListener("scroll", calculatePosition, true);
      };
    } else {
      // Delay para permitir animação de saída
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, calculatePosition]);

  // Fecha ao clicar fora
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setIsOpen]);

  if (!mounted) return null;

  const animationClasses = isOpen
    ? "animate-in fade-in-0 zoom-in-95"
    : "animate-out fade-out-0 zoom-out-95";

  const slideClasses = {
    top: "slide-in-from-bottom-2",
    bottom: "slide-in-from-top-2",
    left: "slide-in-from-right-2",
    right: "slide-in-from-left-2",
  };

  const content = (
    <div
      ref={contentRef}
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        animationClasses,
        isOpen && slideClasses[side],
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      {...props}
    >
      {children}
    </div>
  );

  // Usa portal para renderizar no body
  return typeof document !== "undefined" 
    ? createPortal(content, document.body) 
    : null;
}

// PopoverClose (componente auxiliar)
interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function PopoverClose({ 
  className, 
  children, 
  asChild = false,
  ...props 
}: PopoverCloseProps) {
  const { setIsOpen } = usePopover();

  const handleClick = () => {
    setIsOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        handleClick();
        (children as any).props?.onClick?.(e);
      },
    });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

// PopoverAnchor (para casos onde o trigger e o anchor são diferentes)
interface PopoverAnchorProps {
  children: React.ReactNode;
}

export function PopoverAnchor({ children }: PopoverAnchorProps) {
  const { triggerRef } = usePopover();

  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
    });
  }

  return <>{children}</>;
}