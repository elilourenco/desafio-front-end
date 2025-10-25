"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs component");
  }
  return context;
};

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = ({ 
  defaultValue, 
  value: controlledValue, 
  onValueChange,
  children,
  className,
  ...props 
}: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  
  const value = controlledValue ?? internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = ({ className, ref, ...props }: TabsListProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = ({ 
  className, 
  value, 
  ref,
  ...props 
}: TabsTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = ({ 
  className, 
  value, 
  ref,
  ...props 
}: TabsContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { value: selectedValue } = useTabsContext();
  const isActive = selectedValue === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      aria-hidden={!isActive}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };