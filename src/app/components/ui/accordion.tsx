"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

interface AccordionContextValue {
  openItems: Set<string>;
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within Accordion");
  }
  return context;
};

function Accordion({ 
  type = "single", 
  collapsible = false, 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className,
  ref 
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (defaultValue) {
      return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
    }
    return new Set();
  });

  const controlledOpenItems = React.useMemo(() => {
    if (value !== undefined) {
      return new Set(Array.isArray(value) ? value : [value]);
    }
    return openItems;
  }, [value, openItems]);

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev);
        
        if (type === "single") {
          if (newSet.has(itemValue)) {
            if (collapsible) {
              newSet.clear();
            }
          } else {
            newSet.clear();
            newSet.add(itemValue);
          }
        } else {
          if (newSet.has(itemValue)) {
            newSet.delete(itemValue);
          } else {
            newSet.add(itemValue);
          }
        }

        if (onValueChange) {
          const newValue = type === "single" 
            ? (Array.from(newSet)[0] || "") 
            : Array.from(newSet);
          onValueChange(newValue);
        }

        return newSet;
      });
    },
    [type, collapsible, onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      openItems: value !== undefined ? controlledOpenItems : openItems,
      toggleItem,
      type,
    }),
    [value, controlledOpenItems, openItems, toggleItem, type]
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div ref={ref} className={cn("space-y-2", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
Accordion.displayName = "Accordion";

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AccordionItem({ value, children, className, ref }: AccordionItemProps) {
  const { openItems } = useAccordion();
  const isOpen = openItems.has(value);

  return (
    <div
      ref={ref}
      className={cn("border-b", className)}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
    </div>
  );
}
AccordionItem.displayName = "AccordionItem";

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function AccordionTrigger({ children, className, ref }: AccordionTriggerProps) {
  const { openItems, toggleItem } = useAccordion();
  const parent = React.useContext(AccordionItemContext);
  
  if (!parent) {
    throw new Error("AccordionTrigger must be used within AccordionItem");
  }

  const isOpen = openItems.has(parent.value);

  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        onClick={() => toggleItem(parent.value)}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
      >
        {children}
        <ChevronDown 
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
    </div>
  );
}
AccordionTrigger.displayName = "AccordionTrigger";

interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined);

const AccordionItemProvider: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      {children}
    </AccordionItemContext.Provider>
  );
};

function AccordionContent({ children, className, ref }: AccordionContentProps) {
  const { openItems } = useAccordion();
  const parent = React.useContext(AccordionItemContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number>(0);
  
  if (!parent) {
    throw new Error("AccordionContent must be used within AccordionItem");
  }

  const isOpen = openItems.has(parent.value);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden text-sm transition-all duration-200 ease-out")}
      style={{
        height: isOpen ? `${height}px` : '0px',
      }}
      data-state={isOpen ? "open" : "closed"}
    >
      <div ref={contentRef} className={cn("pb-4 pt-0", className)}>
        {children}
      </div>
    </div>
  );
}
AccordionContent.displayName = "AccordionContent";

// Wrapper para AccordionItem que provê o contexto
function AccordionItemWrapper({ value, children, className, ref }: AccordionItemProps) {
  return (
    <AccordionItemProvider value={value}>
      <AccordionItem ref={ref} value={value} className={className}>
        {children}
      </AccordionItem>
    </AccordionItemProvider>
  );
}
AccordionItemWrapper.displayName = "AccordionItem";

export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent };