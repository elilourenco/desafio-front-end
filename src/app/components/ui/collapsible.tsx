'use client';

import { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

// Types
interface CollapsibleContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined);

// Main Collapsible Component
interface CollapsibleProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Collapsible({ 
  children, 
  open, 
  defaultOpen = false, 
  onOpenChange 
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);

  // Controlled component behavior
  const actualIsOpen = open !== undefined ? open : isOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setIsOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const contextValue = {
    isOpen: actualIsOpen,
    setIsOpen: handleOpenChange,
  };

  return (
    <CollapsibleContext.Provider value={contextValue}>
      {children}
    </CollapsibleContext.Provider>
  );
}

// Collapsible Trigger Component
interface CollapsibleTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

function CollapsibleTrigger({ 
  children, 
  className, 
  asChild 
}: CollapsibleTriggerProps) {
  const context = useContext(CollapsibleContext);
  
  if (!context) {
    throw new Error('CollapsibleTrigger must be used within a Collapsible');
  }

  const { isOpen, setIsOpen } = context;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        toggleOpen();
      },
      'data-state': isOpen ? 'open' : 'closed',
    });
  }

  return (
    <button
      type="button"
      onClick={toggleOpen}
      className={cn(
        'flex items-center justify-between w-full [&[data-state=open]>svg]:rotate-180',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  );
}

// Collapsible Content Component
interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

function CollapsibleContent({ 
  children, 
  className 
}: CollapsibleContentProps) {
  const context = useContext(CollapsibleContext);
  
  if (!context) {
    throw new Error('CollapsibleContent must be used within a Collapsible');
  }

  const { isOpen } = context;

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
        className
      )}
      data-state={isOpen ? 'open' : 'closed'}
      style={{
        maxHeight: isOpen ? '1000px' : '0px',
      }}
    >
      {children}
    </div>
  );
}

// Hook for using collapsible context
function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error('useCollapsible must be used within a Collapsible');
  }
  return context;
}

export { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent, 
  useCollapsible 
};