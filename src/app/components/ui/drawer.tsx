'use client';

import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

// Types
interface DrawerContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  position: number;
  setPosition: (position: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

// Main Drawer Component
interface DrawerProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  snapPoints?: number[];
}

function Drawer({ 
  children, 
  open, 
  defaultOpen = false, 
  onOpenChange,
  snapPoints = [0.5, 0.9] // 50% and 90% by default
}: DrawerProps) {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const contextValue = {
    isOpen,
    setIsOpen: handleOpenChange,
    position,
    setPosition,
    isDragging,
    setIsDragging,
  };

  return (
    <DrawerContext.Provider value={contextValue}>
      {children}
    </DrawerContext.Provider>
  );
}

// Drawer Trigger Component
interface DrawerTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

function DrawerTrigger({ children, asChild }: DrawerTriggerProps) {
  const context = useContext(DrawerContext);
  
  if (!context) {
    throw new Error('DrawerTrigger must be used within a Drawer');
  }

  const { setIsOpen } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        setIsOpen(true);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center justify-center"
    >
      {children}
    </button>
  );
}

// Drawer Overlay Component
interface DrawerOverlayProps {
  className?: string;
  onClick?: () => void;
}

function DrawerOverlay({ className, onClick }: DrawerOverlayProps) {
  const context = useContext(DrawerContext);
  
  if (!context) {
    throw new Error('DrawerOverlay must be used within a Drawer');
  }

  const { isOpen, setIsOpen } = context;

  const handleClick = () => {
    setIsOpen(false);
    onClick?.();
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200',
        className
      )}
      onClick={handleClick}
    />
  );
}

// Drawer Content Component
interface DrawerContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  showDragHandle?: boolean;
}

function DrawerContent({ 
  children, 
  className, 
  showCloseButton = true,
  showDragHandle = true 
}: DrawerContentProps) {
  const context = useContext(DrawerContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const startPosition = useRef(0);

  if (!context) {
    throw new Error('DrawerContent must be used within a Drawer');
  }

  const { isOpen, setIsOpen, position, setPosition, isDragging, setIsDragging } = context;

  const handleClose = () => {
    setIsOpen(false);
    setPosition(0);
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    dragStartY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPosition.current = position;
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = dragStartY.current - clientY;
    const newPosition = Math.min(Math.max(startPosition.current + deltaY / window.innerHeight, 0), 0.95);

    setPosition(newPosition);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Snap to closest point or close if below threshold
    if (position < 0.3) {
      handleClose();
    } else {
      setPosition(0.5); // Snap to middle
    }
  };

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchend', handleDragEnd);

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging]);

  if (!isOpen) return null;

  const contentHeight = Math.max(position * 100, 30); // Minimum 30% height

  return (
    <>
      <DrawerOverlay />
      <div
        ref={contentRef}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[10px] border bg-background shadow-lg',
          'animate-in slide-in-from-bottom duration-300',
          isDragging && 'transition-none',
          className
        )}
        style={{
          height: `${contentHeight}%`,
          transform: `translateY(${isDragging ? 0 : 0}px)`,
        }}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div
            className="mx-auto mt-2 flex h-1.5 w-12 cursor-grab touch-none rounded-full bg-muted active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          />
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-3 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </>
  );
}

// Drawer Close Component
interface DrawerCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

function DrawerClose({ children, asChild, className }: DrawerCloseProps) {
  const context = useContext(DrawerContext);
  
  if (!context) {
    throw new Error('DrawerClose must be used within a Drawer');
  }

  const { setIsOpen } = context;

  const handleClose = () => {
    setIsOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClose();
      },
      className: cn(children.props.className, className),
    });
  }

  return (
    <button
      type="button"
      onClick={handleClose}
      className={className}
    >
      {children}
    </button>
  );
}

// Drawer Header Component
interface DrawerHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function DrawerHeader({ className, children }: DrawerHeaderProps) {
  return (
    <div className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}>
      {children}
    </div>
  );
}

// Drawer Footer Component
interface DrawerFooterProps {
  className?: string;
  children: React.ReactNode;
}

function DrawerFooter({ className, children }: DrawerFooterProps) {
  return (
    <div className={cn('mt-auto flex flex-col gap-2 p-4', className)}>
      {children}
    </div>
  );
}

// Drawer Title Component
interface DrawerTitleProps {
  className?: string;
  children: React.ReactNode;
}

function DrawerTitle({ className, children }: DrawerTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h2>
  );
}

// Drawer Description Component
interface DrawerDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function DrawerDescription({ className, children }: DrawerDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

// Hook for using drawer context
function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a Drawer');
  }
  return context;
}

export {
  Drawer,
  DrawerTrigger,
  DrawerOverlay,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  useDrawer,
};