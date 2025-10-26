'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

// Types
interface ContextMenuContextType {
  isOpen: boolean;
  position: { x: number; y: number };
  closeMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

// Main Context Menu Component
interface ContextMenuProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

function ContextMenu({ children, onOpenChange }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openMenu = (x: number, y: number) => {
    setPosition({ x, y });
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const contextValue = {
    isOpen,
    position,
    closeMenu,
  };

  return (
    <ContextMenuContext.Provider value={contextValue}>
      <ContextMenuTrigger onContextMenu={openMenu}>
        {children}
      </ContextMenuTrigger>
    </ContextMenuContext.Provider>
  );
}

// Context Menu Trigger Component
interface ContextMenuTriggerProps {
  children: React.ReactNode;
  onContextMenu: (x: number, y: number) => void;
}

function ContextMenuTrigger({ children, onContextMenu }: ContextMenuTriggerProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e.clientX, e.clientY);
  };

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
    </div>
  );
}

// Context Menu Content Component
interface ContextMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

function ContextMenuContent({ children, className, align = 'start' }: ContextMenuContentProps) {
  const context = useContext(ContextMenuContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('ContextMenuContent must be used within a ContextMenu');
  }

  const { isOpen, position, closeMenu } = context;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', closeMenu);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', closeMenu);
    };
  }, [isOpen, closeMenu]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeMenu]);

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-80 zoom-in-95',
        alignmentClasses[align],
        className
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {children}
    </div>
  );
}

// Context Menu Item Component
interface ContextMenuItemProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

function ContextMenuItem({ 
  children, 
  className, 
  inset = false, 
  disabled = false,
  onSelect 
}: ContextMenuItemProps) {
  const context = useContext(ContextMenuContext);

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
      context?.closeMenu();
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

// Context Menu Checkbox Item Component
interface ContextMenuCheckboxItemProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

function ContextMenuCheckboxItem({ 
  children, 
  className, 
  checked = false, 
  onCheckedChange,
  disabled = false 
}: ContextMenuCheckboxItemProps) {
  const context = useContext(ContextMenuContext);

  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
      context?.closeMenu();
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

// Context Menu Radio Item Component
interface ContextMenuRadioItemProps {
  children: React.ReactNode;
  className?: string;
  checked?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}

function ContextMenuRadioItem({ 
  children, 
  className, 
  checked = false, 
  onSelect,
  disabled = false 
}: ContextMenuRadioItemProps) {
  const context = useContext(ContextMenuContext);

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
      context?.closeMenu();
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

// Context Menu Label Component
interface ContextMenuLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

function ContextMenuLabel({ children, className, inset = false }: ContextMenuLabelProps) {
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

// Context Menu Separator Component
interface ContextMenuSeparatorProps {
  className?: string;
}

function ContextMenuSeparator({ className }: ContextMenuSeparatorProps) {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-border', className)} />
  );
}

// Context Menu Shortcut Component
interface ContextMenuShortcutProps {
  children: React.ReactNode;
  className?: string;
}

function ContextMenuShortcut({ children, className }: ContextMenuShortcutProps) {
  return (
    <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}>
      {children}
    </span>
  );
}

// Context Menu Group Component
interface ContextMenuGroupProps {
  children: React.ReactNode;
  className?: string;
}

function ContextMenuGroup({ children, className }: ContextMenuGroupProps) {
  return (
    <div className={cn('space-y-0.5', className)}>
      {children}
    </div>
  );
}

// Submenu Components
interface ContextMenuSubProps {
  children: React.ReactNode;
}

function ContextMenuSub({ children }: ContextMenuSubProps) {
  return <div className="relative">{children}</div>;
}

interface ContextMenuSubTriggerProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

function ContextMenuSubTrigger({ children, className, inset = false }: ContextMenuSubTriggerProps) {
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

interface ContextMenuSubContentProps {
  children: React.ReactNode;
  className?: string;
}

function ContextMenuSubContent({ children, className }: ContextMenuSubContentProps) {
  return (
    <div className={cn('min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', className)}>
      {children}
    </div>
  );
}

// Radio Group Component
interface ContextMenuRadioGroupProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}

function ContextMenuRadioGroup({ children, value, onValueChange }: ContextMenuRadioGroupProps) {
  return (
    <div>
      {children}
    </div>
  );
}

// Hook for using context menu
function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenu');
  }
  return context;
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
  useContextMenu,
};