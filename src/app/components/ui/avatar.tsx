"use client"
import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

const Avatar = ({ className, ref, ...props }: AvatarProps) => (
  <div
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
);
Avatar.displayName = "Avatar";

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, 'alt' | 'ref'> {
  ref?: React.Ref<HTMLDivElement>;
  alt?: string;
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

const AvatarImage = ({ 
  className, 
  ref, 
  onLoadingStatusChange, 
  onLoad, 
  onError,
  alt = "",
  fill = true,
  ...props 
}: AvatarImageProps) => {
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onLoadingStatusChange?.("loaded");
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onLoadingStatusChange?.("error");
    onError?.(e);
  };

  return (
    <div ref={ref} className={cn("aspect-square h-full w-full", className)}>
      <Image
        alt={alt}
        fill={fill}
        className="object-cover"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  delayMs?: number;
}

const AvatarFallback = ({ className, ref, delayMs, children, ...props }: AvatarFallbackProps) => {
  const [canRender, setCanRender] = React.useState(delayMs === undefined);

  React.useEffect(() => {
    if (delayMs !== undefined) {
      const timer = setTimeout(() => setCanRender(true), delayMs);
      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  if (!canRender) return null;

  return (
    <div
      ref={ref}
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  );
};
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };