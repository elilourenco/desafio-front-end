'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

// Types
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined);

// Main Dropdown Menu Component
interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({ children, open, defaultOpen = false, onOpenChange }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with controlled prop
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current && 
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const contextValue = {
    isOpen,
    setIsOpen: handleOpenChange,
    triggerRef,
    contentRef,
  };

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

// Dropdown Menu Trigger Component
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

function DropdownMenuTrigger({ children, asChild, className }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
  }

  const { setIsOpen, triggerRef } = context;

  const handleClick = () => {
    setIsOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick();
      },
      className: cn(children.props.className, className),
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleClick}
      className={cn('inline-flex items-center justify-center', className)}
    >
      {children}
    </button>
  );
}

// Dropdown Menu Content Component
interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

function DropdownMenuContent({ 
  children, 
  className, 
  align = 'start',
  sideOffset = 4 
}: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu');
  }

  const { isOpen, contentRef, triggerRef } = context;

  // Position content relative to trigger
  useEffect(() => {
    if (isOpen && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      let left = triggerRect.left;
      let top = triggerRect.bottom + sideOffset;

      // Adjust for viewport boundaries
      if (left + contentRect.width > window.innerWidth) {
        left = window.innerWidth - contentRect.width - 8;
      }
      if (top + contentRect.height > window.innerHeight) {
        top = triggerRect.top - contentRect.height - sideOffset;
      }

      contentRef.current.style.left = `${left}px`;
      contentRef.current.style.top = `${top}px`;
    }
  }, [isOpen, sideOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
    >
      {children}
    </div>
  );
}

// Dropdown Menu Item Component
interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

function DropdownMenuItem({ 
  children, 
  className, 
  inset = false, 
  disabled = false,
  onSelect 
}: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
      context?.setIsOpen(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'transition-colors focus:bg-accent focus:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        inset && 'pl-8',
        !disabled && 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

// Dropdown Menu Checkbox Item Component
interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

function DropdownMenuCheckboxItem({ 
  children, 
  className, 
  checked = false, 
  onCheckedChange,
  disabled = false 
}: DropdownMenuCheckboxItemProps) {
  const context = useContext(DropdownMenuContext);

  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
      context?.setIsOpen(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 text-sm outline-none',
        'transition-colors focus:bg-accent focus:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        !disabled && 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      <span className={cn('pl-8')}>
        {children}
      </span>
    </button>
  );
}

// Dropdown Menu Radio Item Component
interface DropdownMenuRadioItemProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

function DropdownMenuRadioItem({ 
  children, 
  className, 
  checked = false, 
  onSelect,
  disabled = false 
}: DropdownMenuRadioItemProps) {
  const context = useContext(DropdownMenuContext);

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
      context?.setIsOpen(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 text-sm outline-none',
        'transition-colors focus:bg-accent focus:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        !disabled && 'hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      <span className={cn('pl-8')}>
        {children}
      </span>
    </button>
  );
}

// Dropdown Menu Label Component
interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

function DropdownMenuLabel({ children, className, inset = false }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn(
        'px-2 py-1.5 text-sm font-semibold text-foreground select-none',
        inset && 'pl-8',
        className
      )}
    >
      {children}
    </div>
  );
}

// Dropdown Menu Separator Component
interface DropdownMenuSeparatorProps {
  className?: string;
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} />
  );
}

// Dropdown Menu Shortcut Component
interface DropdownMenuShortcutProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuShortcut({ children, className }: DropdownMenuShortcutProps) {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)}>
      {children}
    </span>
  );
}

// Dropdown Menu Group Component
interface DropdownMenuGroupProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuGroup({ children, className }: DropdownMenuGroupProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {children}
    </div>
  );
}

// Submenu Components
interface DropdownMenuSubProps {
  children: React.ReactNode;
}

function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  return <div className="relative">{children}</div>;
}

interface DropdownMenuSubTriggerProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

function DropdownMenuSubTrigger({ children, className, inset = false }: DropdownMenuSubTriggerProps) {
  const [isSubOpen, setIsSubOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          'flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
          inset && 'pl-8',
          className
        )}
        onMouseEnter={() => setIsSubOpen(true)}
        onMouseLeave={() => setIsSubOpen(false)}
      >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
      </button>

      {isSubOpen && (
        <div className="absolute left-full top-0 ml-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownMenuSubContentProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownMenuSubContent({ children, className }: DropdownMenuSubContentProps) {
  return (
    <div className={cn(
      'min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      'animate-in fade-in-0 zoom-in-95',
      className
    )}>
      {children}
    </div>
  );
}

// Radio Group Component
interface DropdownMenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

function DropdownMenuRadioGroup({ children, value, onValueChange }: DropdownMenuRadioGroupProps) {
  return (
    <div>
      {children}
    </div>
  );
}

// Hook for using dropdown menu
function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu');
  }
  return context;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  useDropdownMenu,
};