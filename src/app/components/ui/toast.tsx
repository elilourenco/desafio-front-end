"use client"

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Context para gerenciar toasts
interface ToastContextType {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// Tipos
interface ToastType {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastType, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove após duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Viewport
function ToastViewport({
  toasts,
  removeToast,
}: {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Variantes do Toast
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all mb-2 animate-in slide-in-from-top-full sm:slide-in-from-bottom-full data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-50",
        destructive:
          "destructive group border-red-500 bg-red-600 text-white dark:border-red-900 dark:bg-red-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Toast Component
function Toast({
  toast,
  onClose,
}: {
  toast: ToastType;
  onClose: () => void;
}) {
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Tempo da animação
  };

  return (
    <div
      className={cn(toastVariants({ variant: toast.variant }))}
      data-state={isClosing ? "closed" : "open"}
    >
      <div className="flex-1 space-y-1">
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
      </div>
      {toast.action && (
        <ToastAction
          onClick={() => {
            toast.action?.onClick();
            handleClose();
          }}
          variant={toast.variant}
        >
          {toast.action.label}
        </ToastAction>
      )}
      <ToastClose onClick={handleClose} variant={toast.variant} />
    </div>
  );
}

// Toast Title
function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold">{children}</div>;
}

// Toast Description
function ToastDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm opacity-90">{children}</div>;
}

// Toast Action
function ToastAction({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "destructive" &&
          "border-red-200 hover:bg-red-700 hover:border-red-400 focus:ring-red-400"
      )}
    >
      {children}
    </button>
  );
}

// Toast Close
function ToastClose({
  onClick,
  variant,
}: {
  onClick: () => void;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity",
        "hover:text-gray-900 dark:hover:text-gray-50",
        "group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
        variant === "destructive" &&
          "text-red-300 hover:text-red-50 focus:ring-red-400 focus:ring-offset-red-600"
      )}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

// Helper hook para facilitar o uso
export function toast(options: Omit<ToastType, "id">) {
  // Este é um placeholder - você precisará implementar um singleton ou usar o context
  console.warn("Use useToast() hook dentro de um componente");
}

export type { ToastType };
export { ToastTitle, ToastDescription, ToastAction, ToastClose };