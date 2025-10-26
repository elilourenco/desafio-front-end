'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

// Types
interface DialogContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Main Dialog Component
interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open, defaultOpen = false, onOpenChange }: DialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);

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
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

// Dialog Trigger Component
interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  const context = useContext(DialogContext);
  
  if (!context) {
    throw new Error('DialogTrigger must be used within a Dialog');
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

// Dialog Overlay Component
interface DialogOverlayProps {
  className?: string;
  onClick?: () => void;
}

function DialogOverlay({ className, onClick }: DialogOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200',
        className
      )}
      onClick={onClick}
    />
  );
}

// Dialog Content Component
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

function DialogContent({ 
  children, 
  className, 
  onClose,
  showCloseButton = true 
}: DialogContentProps) {
  const context = useContext(DialogContext);
  
  if (!context) {
    throw new Error('DialogContent must be used within a Dialog');
  }

  const { isOpen, setIsOpen } = context;

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
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

  if (!isOpen) return null;

  return (
    <>
      <DialogOverlay onClick={handleClose} />
      <div
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]',
          'sm:rounded-lg',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
        
        {showCloseButton && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </>
  );
}

// Dialog Close Component
interface DialogCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

function DialogClose({ children, asChild, className }: DialogCloseProps) {
  const context = useContext(DialogContext);
  
  if (!context) {
    throw new Error('DialogClose must be used within a Dialog');
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

// Dialog Header Component
interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
      {children}
    </div>
  );
}

// Dialog Footer Component
interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  );
}

// Dialog Title Component
interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h2>
  );
}

// Dialog Description Component
interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
}

// Hook for using dialog context
function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a Dialog');
  }
  return context;
}

// Export components
export {
  Dialog,
  DialogTrigger,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialog,
};