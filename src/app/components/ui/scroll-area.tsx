"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both";
}

const ScrollArea = ({ 
  className, 
  children, 
  orientation = "vertical",
  ...props 
}: ScrollAreaProps) => {
  const [showScrollbar, setShowScrollbar] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const checkScroll = () => {
      if (orientation === "vertical" || orientation === "both") {
        const hasVerticalScroll = scrollElement.scrollHeight > scrollElement.clientHeight;
        setShowScrollbar(hasVerticalScroll);
      }
      if (orientation === "horizontal" || orientation === "both") {
        const hasHorizontalScroll = scrollElement.scrollWidth > scrollElement.clientWidth;
        setShowScrollbar(hasHorizontalScroll);
      }
    };

    checkScroll();
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(scrollElement);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [orientation]);

  const getOverflowClass = () => {
    switch (orientation) {
      case "horizontal":
        return "overflow-x-auto overflow-y-hidden";
      case "both":
        return "overflow-auto";
      default:
        return "overflow-y-auto overflow-x-hidden";
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <div
        ref={scrollRef}
        className={cn(
          "h-full w-full rounded-[inherit]",
          getOverflowClass(),
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
          "hover:scrollbar-thumb-border/80"
        )}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "hsl(var(--border)) transparent",
        }}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
};

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal";
  forceShow?: boolean;
}

const ScrollBar = ({ 
  className, 
  orientation = "vertical",
  forceShow = false,
  ...props 
}: ScrollBarProps) => {
  const scrollbarRef = React.useRef<HTMLDivElement>(null);
  const thumbRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [thumbSize, setThumbSize] = React.useState(0);
  const [thumbPosition, setThumbPosition] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(forceShow);

  const isVertical = orientation === "vertical";

  React.useEffect(() => {
    const scrollContainer = scrollbarRef.current?.parentElement?.querySelector('[data-scroll-viewport]');
    if (!scrollContainer) return;

    const updateScrollbar = () => {
      if (isVertical) {
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const scrollTop = scrollContainer.scrollTop;

        if (scrollHeight <= clientHeight) {
          setIsVisible(false);
          return;
        }

        setIsVisible(true);
        const thumbHeight = (clientHeight / scrollHeight) * clientHeight;
        const thumbTop = (scrollTop / scrollHeight) * clientHeight;

        setThumbSize(thumbHeight);
        setThumbPosition(thumbTop);
      } else {
        const scrollWidth = scrollContainer.scrollWidth;
        const clientWidth = scrollContainer.clientWidth;
        const scrollLeft = scrollContainer.scrollLeft;

        if (scrollWidth <= clientWidth) {
          setIsVisible(false);
          return;
        }

        setIsVisible(true);
        const thumbWidth = (clientWidth / scrollWidth) * clientWidth;
        const thumbLeft = (scrollLeft / scrollWidth) * clientWidth;

        setThumbSize(thumbWidth);
        setThumbPosition(thumbLeft);
      }
    };

    updateScrollbar();
    scrollContainer.addEventListener('scroll', updateScrollbar);
    const resizeObserver = new ResizeObserver(updateScrollbar);
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener('scroll', updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [isVertical]);

  if (!isVisible && !forceShow) return null;

  return (
    <div
      ref={scrollbarRef}
      className={cn(
        "flex touch-none select-none transition-colors",
        isVertical && "h-full w-2.5 border-l border-l-transparent p-[1px]",
        !isVertical && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
        className
      )}
      {...props}
    >
      <div
        ref={thumbRef}
        className="relative rounded-full bg-border hover:bg-border/80 transition-colors"
        style={{
          [isVertical ? 'height' : 'width']: `${thumbSize}px`,
          [isVertical ? 'top' : 'left']: `${thumbPosition}px`,
          position: 'absolute',
        }}
      />
    </div>
  );
};

// Versão simplificada usando apenas CSS nativo
const SimpleScrollArea = ({ 
  className, 
  children,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "relative overflow-auto h-full w-full rounded-[inherit]",
        // Estilização customizada da scrollbar
        "[&::-webkit-scrollbar]:w-2.5",
        "[&::-webkit-scrollbar]:h-2.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:border-2",
        "[&::-webkit-scrollbar-thumb]:border-transparent",
        "hover:[&::-webkit-scrollbar-thumb]:bg-border/80",
        className
      )}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "hsl(var(--border)) transparent",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export { ScrollArea, ScrollBar, SimpleScrollArea };