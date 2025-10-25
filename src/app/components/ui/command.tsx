'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '../ui/dialog';

// Command Component
interface CommandProps {
  children: React.ReactNode;
  className?: string;
  shouldFilter?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Command({ 
  children, 
  className, 
  shouldFilter = true,
  value,
  onValueChange 
}: CommandProps) {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

// Command Dialog Component
interface CommandDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CommandDialog({ children, open, onOpenChange }: CommandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// Command Input Component
interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

function CommandInput({ 
  placeholder = "Search...", 
  value,
  onValueChange,
  className 
}: CommandInputProps) {
  const [internalValue, setInternalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        autoFocus
      />
    </div>
  );
}

// Command List Component
interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

function CommandList({ children, className }: CommandListProps) {
  return (
    <div
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    >
      {children}
    </div>
  );
}

// Command Empty Component
interface CommandEmptyProps {
  children: React.ReactNode;
}

function CommandEmpty({ children }: CommandEmptyProps) {
  return (
    <div className="py-6 text-center text-sm">
      {children}
    </div>
  );
}

// Command Group Component
interface CommandGroupProps {
  children: React.ReactNode;
  className?: string;
  heading?: React.ReactNode;
}

function CommandGroup({ children, className, heading }: CommandGroupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden p-1 text-foreground",
        className
      )}
    >
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

// Command Separator Component
interface CommandSeparatorProps {
  className?: string;
}

function CommandSeparator({ className }: CommandSeparatorProps) {
  return (
    <div className={cn("-mx-1 h-px bg-border", className)} />
  );
}

// Command Item Component
interface CommandItemProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: () => void;
  disabled?: boolean;
  value?: string;
}

function CommandItem({ 
  children, 
  className, 
  onSelect, 
  disabled = false,
  value 
}: CommandItemProps) {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      data-selected={isSelected}
      data-disabled={disabled}
    >
      {children}
    </div>
  );
}

// Command Shortcut Component
interface CommandShortcutProps {
  children: React.ReactNode;
  className?: string;
}

function CommandShortcut({ children, className }: CommandShortcutProps) {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}>
      {children}
    </span>
  );
}

// Custom hook for command palette
function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  useCommandPalette,
};