'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Types
interface HoverCardProps {
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  onOpenChange?: (open: boolean) => void;
}

interface HoverCardTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

interface HoverCardContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

// Hover Card Context
interface HoverCardContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const HoverCardContext = createContext<HoverCardContextType | undefined>(undefined);

function createContext<T>() {
  return React.createContext<T | undefined>(undefined);
}

const HoverCardContext = createContext<HoverCardContextType | undefined>(undefined);

// Main Hover Card Component
function HoverCard({ 
  children, 
  openDelay = 200, 
  closeDelay = 300,
  onOpenChange 
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const openTimeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  const handleOpen = () => {
    clearTimeout(closeTimeoutRef.current);
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      onOpenChange?.(true);
    }, openDelay);
  };

  const handleClose = () => {
    clearTimeout(openTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      onOpenChange?.(false);
    }, closeDelay);
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
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(openTimeoutRef.current);
      clearTimeout(closeTimeoutRef.current);
    };
  }, [isOpen]);

  // Position content relative to trigger
  useEffect(() => {
    if (isOpen && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      // Basic positioning - can be enhanced with @floating-ui for complex cases
      contentRef.current.style.left = `${triggerRect.left}px`;
      contentRef.current.style.top = `${triggerRect.bottom + 4}px`;
    }
  }, [isOpen]);

  const contextValue = {
    isOpen,
    setIsOpen,
    triggerRef,
    contentRef,
  };

  return (
    <HoverCardContext.Provider value={contextValue}>
      <div 
        className="relative inline-block"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

// Hover Card Trigger Component
function HoverCardTrigger({ children, className, asChild }: HoverCardTriggerProps) {
  const context = useContext(HoverCardContext);
  
  if (!context) {
    throw new Error('HoverCardTrigger must be used within a HoverCard');
  }

  const { triggerRef } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      className: cn(children.props.className, className),
    });
  }

  return (
    <span
      ref={triggerRef}
      className={cn('inline-block cursor-default', className)}
    >
      {children}
    </span>
  );
}

// Hover Card Content Component
function HoverCardContent({ 
  children, 
  className, 
  align = 'center',
  sideOffset = 4,
  side = 'bottom'
}: HoverCardContentProps) {
  const context = useContext(HoverCardContext);
  
  if (!context) {
    throw new Error('HoverCardContent must be used within a HoverCard');
  }

  const { isOpen, contentRef } = context;

  if (!isOpen) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        sideClasses[side],
        className
      )}
      style={{
        marginTop: side === 'bottom' ? sideOffset : undefined,
        marginBottom: side === 'top' ? sideOffset : undefined,
        marginLeft: side === 'right' ? sideOffset : undefined,
        marginRight: side === 'left' ? sideOffset : undefined,
      }}
    >
      {children}
      {/* Arrow indicator */}
      <div
        className={cn(
          'absolute w-2 h-2 rotate-45 bg-popover border',
          {
            'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l': side === 'bottom',
            'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r': side === 'top',
            'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b': side === 'right',
            'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t': side === 'left',
          }
        )}
      />
    </div>
  );
}

// Enhanced version with Floating UI for precise positioning
function useFloating() {
  // This would integrate with @floating-ui for advanced positioning
  // For simplicity, we're using basic positioning here
  return {
    x: 0,
    y: 0,
    strategy: 'absolute' as const,
  };
}

// Hook to use hover card context
function useHoverCard() {
  const context = useContext(HoverCardContext);
  if (!context) {
    throw new Error('useHoverCard must be used within a HoverCard');
  }
  return context;
}

// Export components
export { HoverCard, HoverCardTrigger, HoverCardContent, useHoverCard };