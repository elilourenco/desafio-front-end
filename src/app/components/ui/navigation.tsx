'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

// Types
interface NavigationMenuProps {
  className?: string;
  children: React.ReactNode;
}

interface NavigationMenuListProps {
  className?: string;
  children: React.ReactNode;
}

interface NavigationMenuItemProps {
  className?: string;
  children: React.ReactNode;
}

interface NavigationMenuTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface NavigationMenuContentProps {
  className?: string;
  children: React.ReactNode;
}

interface NavigationMenuLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// Style variants
const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50'
);

// Navigation Menu Component
function NavigationMenu({ className, children, ...props }: NavigationMenuProps) {
  return (
    <nav
      className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
      {...props}
    >
      {children}
    </nav>
  );
}

// Navigation Menu List Component
function NavigationMenuList({ className, children, ...props }: NavigationMenuListProps) {
  return (
    <ul
      className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
      {...props}
    >
      {children}
    </ul>
  );
}

// Navigation Menu Item Component
function NavigationMenuItem({ className, children, ...props }: NavigationMenuItemProps) {
  return (
    <li className={cn('relative', className)} {...props}>
      {children}
    </li>
  );
}

// Navigation Menu Trigger Component
function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      className={cn(navigationMenuTriggerStyle(), 'group', className, {
        'bg-accent/50': isOpen,
      })}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'relative top-[1px] ml-1 h-3 w-3 transition duration-200',
          isOpen && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

// Navigation Menu Content Component
function NavigationMenuContent({ className, children, ...props }: NavigationMenuContentProps) {
  return (
    <div
      className={cn(
        'absolute left-0 top-full mt-1.5 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95',
        'md:absolute md:w-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Navigation Menu Link Component
function NavigationMenuLink({ href, className, children, onClick, ...props }: NavigationMenuLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}

// Custom hook for dropdown functionality
function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return { isOpen, setIsOpen, dropdownRef };
}

// Enhanced Navigation Menu with Dropdown
interface EnhancedNavigationMenuProps {
  className?: string;
  children: React.ReactNode;
}

function EnhancedNavigationMenu({ className, children }: EnhancedNavigationMenuProps) {
  return (
    <nav
      className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
    >
      {children}
    </nav>
  );
}

// Enhanced Navigation Menu Item with Dropdown
interface EnhancedNavigationMenuItemProps {
  className?: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
}

function EnhancedNavigationMenuItem({ className, trigger, content }: EnhancedNavigationMenuItemProps) {
  const { isOpen, setIsOpen, dropdownRef } = useDropdown();

  return (
    <li className={cn('relative', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-56 rounded-md border bg-white shadow-lg animate-in fade-in-0 zoom-in-95">
          {content}
        </div>
      )}
    </li>
  );
}

// Example usage component
export function ExampleNavigation() {
  return (
    <EnhancedNavigationMenu>
      <NavigationMenuList>
        <EnhancedNavigationMenuItem
          trigger={
            <NavigationMenuTrigger>
              Products
            </NavigationMenuTrigger>
          }
          content={
            <div className="p-2">
              <NavigationMenuLink href="/products/laptops">
                <div className="text-sm font-medium">Laptops</div>
                <div className="text-xs text-muted-foreground">High-performance laptops</div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/products/phones">
                <div className="text-sm font-medium">Phones</div>
                <div className="text-xs text-muted-foreground">Smartphones and accessories</div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/products/tablets">
                <div className="text-sm font-medium">Tablets</div>
                <div className="text-xs text-muted-foreground">Tablets and e-readers</div>
              </NavigationMenuLink>
            </div>
          }
        />

        <NavigationMenuItem>
          <NavigationMenuLink href="/solutions">
            Solutions
          </NavigationMenuLink>
        </NavigationMenuItem>

        <EnhancedNavigationMenuItem
          trigger={
            <NavigationMenuTrigger>
              Resources
            </NavigationMenuTrigger>
          }
          content={
            <div className="p-2">
              <NavigationMenuLink href="/docs">
                <div className="text-sm font-medium">Documentation</div>
                <div className="text-xs text-muted-foreground">API references and guides</div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/blog">
                <div className="text-sm font-medium">Blog</div>
                <div className="text-xs text-muted-foreground">Latest news and updates</div>
              </NavigationMenuLink>
              <NavigationMenuLink href="/support">
                <div className="text-sm font-medium">Support</div>
                <div className="text-xs text-muted-foreground">Get help and support</div>
              </NavigationMenuLink>
            </div>
          }
        />

        <NavigationMenuItem>
          <NavigationMenuLink href="/pricing">
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </EnhancedNavigationMenu>
  );
}

// Export components
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
};

// Export enhanced components
export {
  EnhancedNavigationMenu,
  EnhancedNavigationMenuItem,
};