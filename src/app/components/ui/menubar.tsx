"use client"


import * as React from "react";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

// Context para controlar o estado do menu
interface MenubarContextType {
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
}

const MenubarContext = React.createContext<MenubarContextType | null>(null);

const useMenubar = () => {
  const context = React.useContext(MenubarContext);
  if (!context) throw new Error("Menubar components must be used within Menubar");
  return context;
};

// Menubar Root
interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Menubar({ className, children, ...props }: MenubarProps) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  return (
    <MenubarContext.Provider value={{ openMenu, setOpenMenu }}>
      <div
        className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)}
        {...props}
      >
        {children}
      </div>
    </MenubarContext.Provider>
  );
}

// MenubarMenu
interface MenubarMenuProps {
  children: React.ReactNode;
  value: string;
}

const MenubarMenuContext = React.createContext<{ value: string; isOpen: boolean } | null>(null);

export function MenubarMenu({ children, value }: MenubarMenuProps) {
  const { openMenu, setOpenMenu } = useMenubar();
  const isOpen = openMenu === value;

  return (
    <MenubarMenuContext.Provider value={{ value, isOpen }}>
      <div className="relative">{children}</div>
    </MenubarMenuContext.Provider>
  );
}

// MenubarTrigger
interface MenubarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function MenubarTrigger({ className, children, ...props }: MenubarTriggerProps) {
  const { openMenu, setOpenMenu } = useMenubar();
  const menu = React.useContext(MenubarMenuContext);
  
  if (!menu) throw new Error("MenubarTrigger must be used within MenubarMenu");

  const handleClick = () => {
    setOpenMenu(menu.isOpen ? null : menu.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        menu.isOpen && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-expanded={menu.isOpen}
      aria-haspopup="menu"
      {...props}
    >
      {children}
    </button>
  );
}

// MenubarContent
interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end";
}

export function MenubarContent({ 
  className, 
  children, 
  align = "start",
  ...props 
}: MenubarContentProps) {
  const { setOpenMenu } = useMenubar();
  const menu = React.useContext(MenubarMenuContext);
  const ref = React.useRef<HTMLDivElement>(null);

  if (!menu) throw new Error("MenubarContent must be used within MenubarMenu");

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    if (menu.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [menu.isOpen, setOpenMenu]);

  if (!menu.isOpen) return null;

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-full mt-2 z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        alignmentClasses[align],
        className
      )}
      role="menu"
      {...props}
    >
      {children}
    </div>
  );
}

// MenubarItem
interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export function MenubarItem({ 
  className, 
  children, 
  inset, 
  disabled,
  onSelect,
  ...props 
}: MenubarItemProps) {
  const { setOpenMenu } = useMenubar();

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
      setOpenMenu(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        inset && "pl-8",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
}

// MenubarCheckboxItem
interface MenubarCheckboxItemProps extends Omit<MenubarItemProps, 'onSelect'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function MenubarCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: MenubarCheckboxItemProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
}

// MenubarRadioGroup
interface MenubarRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const MenubarRadioContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
} | null>(null);

export function MenubarRadioGroup({ value, onValueChange, children, ...props }: MenubarRadioGroupProps) {
  return (
    <MenubarRadioContext.Provider value={{ value, onValueChange }}>
      <div role="group" {...props}>
        {children}
      </div>
    </MenubarRadioContext.Provider>
  );
}

// MenubarRadioItem
interface MenubarRadioItemProps extends Omit<MenubarItemProps, 'onSelect'> {
  value: string;
}

export function MenubarRadioItem({
  className,
  children,
  value,
  disabled,
  ...props
}: MenubarRadioItemProps) {
  const radioGroup = React.useContext(MenubarRadioContext);
  
  if (!radioGroup) {
    throw new Error("MenubarRadioItem must be used within MenubarRadioGroup");
  }

  const isChecked = radioGroup.value === value;

  const handleClick = () => {
    if (!disabled && radioGroup.onValueChange) {
      radioGroup.onValueChange(value);
    }
  };

  return (
    <div
      role="menuitemradio"
      aria-checked={isChecked}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isChecked && <Circle className="h-2 w-2 fill-current" />}
      </span>
      {children}
    </div>
  );
}

// MenubarLabel
interface MenubarLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export function MenubarLabel({ className, inset, ...props }: MenubarLabelProps) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
      {...props}
    />
  );
}

// MenubarSeparator
export function MenubarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}

// MenubarShortcut
interface MenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function MenubarShortcut({ className, ...props }: MenubarShortcutProps) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
      {...props}
    />
  );
}

// MenubarSub (para submenus)
interface MenubarSubProps {
  children: React.ReactNode;
}

const MenubarSubContext = React.createContext<{ isOpen: boolean; setIsOpen: (open: boolean) => void } | null>(null);

export function MenubarSub({ children }: MenubarSubProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <MenubarSubContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </MenubarSubContext.Provider>
  );
}

// MenubarSubTrigger
interface MenubarSubTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export function MenubarSubTrigger({ className, inset, children, ...props }: MenubarSubTriggerProps) {
  const sub = React.useContext(MenubarSubContext);
  
  if (!sub) throw new Error("MenubarSubTrigger must be used within MenubarSub");

  return (
    <div
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={sub.isOpen}
      tabIndex={0}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      onMouseEnter={() => sub.setIsOpen(true)}
      onMouseLeave={() => sub.setIsOpen(false)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  );
}

// MenubarSubContent
interface MenubarSubContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenubarSubContent({ className, children, ...props }: MenubarSubContentProps) {
  const sub = React.useContext(MenubarSubContext);
  
  if (!sub) throw new Error("MenubarSubContent must be used within MenubarSub");
  if (!sub.isOpen) return null;

  return (
    <div
      role="menu"
      className={cn(
        "absolute left-full top-0 ml-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// MenubarGroup (apenas um wrapper semântico)
interface MenubarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenubarGroup({ children, ...props }: MenubarGroupProps) {
  return <div role="group" {...props}>{children}</div>;
}