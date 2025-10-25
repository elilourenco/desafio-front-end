'use client';

import { cn } from '@/lib/utils';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  showValue = false,
  size = 'md',
  variant = 'default',
  ...props
}: ProgressProps) {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size styles
  const sizeStyles = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-primary',
    success: 'bg-green-500',
    destructive: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="w-full space-y-2">
      {/* Progress Bar */}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantStyles[variant],
            indicatorClassName
          )}
          style={{ 
            width: `${percentage}%`,
            transition: 'width 0.3s ease-in-out'
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>

      {/* Optional Value Display */}
      {showValue && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{value}%</span>
          <span>{max}%</span>
        </div>
      )}
    </div>
  );
}

// Alternative version with steps
interface StepProgressProps {
  steps: number;
  currentStep: number;
  className?: string;
  stepClassName?: string;
  activeStepClassName?: string;
}

function StepProgress({
  steps,
  currentStep,
  className,
  stepClassName,
  activeStepClassName,
}: StepProgressProps) {
  return (
    <div className={cn('flex w-full items-center justify-between', className)}>
      {Array.from({ length: steps }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
              index < currentStep
                ? 'border-primary bg-primary text-primary-foreground'
                : index === currentStep
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 bg-background text-muted-foreground',
              stepClassName,
              index === currentStep && activeStepClassName
            )}
          >
            {index + 1}
          </div>

          {/* Connector Line */}
          {index < steps - 1 && (
            <div
              className={cn(
                'h-1 flex-1 transition-colors',
                index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Circular Progress Component
interface CircularProgressProps {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  indicatorClassName?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
}

function CircularProgress({
  value = 0,
  max = 100,
  size = 40,
  strokeWidth = 4,
  className,
  indicatorClassName,
  showValue = false,
  variant = 'default',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantStyles = {
    default: 'text-primary stroke-primary',
    success: 'text-green-500 stroke-green-500',
    destructive: 'text-red-500 stroke-red-500',
    warning: 'text-yellow-500 stroke-yellow-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted opacity-30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-300 ease-in-out',
            variantStyles[variant],
            indicatorClassName
          )}
        />
      </svg>

      {/* Optional center text */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-xs font-medium', variantStyles[variant])}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Loading Progress Component
interface LoadingProgressProps {
  isLoading?: boolean;
  className?: string;
  indicatorClassName?: string;
}

function LoadingProgress({
  isLoading = true,
  className,
  indicatorClassName,
}: LoadingProgressProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'relative h-1 w-full overflow-hidden bg-secondary',
        className
      )}
    >
      <div
        className={cn(
          'absolute h-full w-1/4 bg-primary animate-[loading_1.5s_ease-in-out_infinite]',
          indicatorClassName
        )}
        style={{
          animation: 'loading 1.5s ease-in-out infinite',
        }}
      />
    </div>
  );
}

// Export components
export { Progress, StepProgress, CircularProgress, LoadingProgress };