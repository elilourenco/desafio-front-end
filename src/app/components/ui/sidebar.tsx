
"use client"
import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  minStepsBetweenThumbs?: number;
}

export function Slider({
  className,
  value: controlledValue,
  defaultValue = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = "horizontal",
  minStepsBetweenThumbs = 0,
  ...props
}: SliderProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<number[]>(defaultValue);
  const [activeThumb, setActiveThumb] = React.useState<number | null>(null);
  const [isFocused, setIsFocused] = React.useState<number | null>(null);

  // Determina se é controlado ou não controlado
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  // Função para atualizar o valor
  const updateValue = React.useCallback(
    (newValue: number[]) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  // Converte valor para porcentagem
  const valueToPercent = React.useCallback(
    (val: number) => {
      return ((val - min) / (max - min)) * 100;
    },
    [min, max]
  );

  // Converte posição do mouse para valor
  const getValueFromPosition = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      let percent: number;

      if (orientation === "horizontal") {
        percent = (clientX - rect.left) / rect.width;
      } else {
        percent = 1 - (clientY - rect.top) / rect.height;
      }

      percent = Math.max(0, Math.min(1, percent));
      
      const range = max - min;
      let newValue = min + percent * range;

      // Arredonda para o step mais próximo
      if (step > 0) {
        const steps = Math.round((newValue - min) / step);
        newValue = min + steps * step;
      }

      return Math.max(min, Math.min(max, newValue));
    },
    [min, max, step, orientation]
  );

  // Handler para movimento do mouse
  const handleMove = React.useCallback(
    (clientX: number, clientY: number) => {
      if (activeThumb === null || disabled) return;

      const newValue = getValueFromPosition(clientX, clientY);
      const newValues = [...value];
      
      // Verifica limites entre thumbs
      if (minStepsBetweenThumbs > 0) {
        const minDistance = step * minStepsBetweenThumbs;
        
        if (activeThumb > 0 && newValue < newValues[activeThumb - 1] + minDistance) {
          return;
        }
        if (activeThumb < newValues.length - 1 && newValue > newValues[activeThumb + 1] - minDistance) {
          return;
        }
      }

      newValues[activeThumb] = newValue;
      updateValue(newValues);
    },
    [activeThumb, disabled, value, getValueFromPosition, minStepsBetweenThumbs, step, updateValue]
  );

  // Mouse down no thumb
  const handleThumbMouseDown = (index: number) => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setActiveThumb(index);
  };

  // Mouse down no track (move o thumb mais próximo)
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    const newValue = getValueFromPosition(e.clientX, e.clientY);
    
    // Encontra o thumb mais próximo
    let closestThumb = 0;
    let closestDistance = Math.abs(value[0] - newValue);
    
    for (let i = 1; i < value.length; i++) {
      const distance = Math.abs(value[i] - newValue);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestThumb = i;
      }
    }

    const newValues = [...value];
    newValues[closestThumb] = newValue;
    updateValue(newValues);
    setActiveThumb(closestThumb);
  };

  // Efeito para movimento global do mouse
  React.useEffect(() => {
    if (activeThumb === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      setActiveThumb(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeThumb, handleMove]);

  // Suporte a teclado
  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    if (disabled) return;

    let newValue = value[index];
    const stepSize = step || 1;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        newValue = Math.min(max, newValue + stepSize);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        newValue = Math.max(min, newValue - stepSize);
        break;
      case "PageUp":
        e.preventDefault();
        newValue = Math.min(max, newValue + stepSize * 10);
        break;
      case "PageDown":
        e.preventDefault();
        newValue = Math.max(min, newValue - stepSize * 10);
        break;
      case "Home":
        e.preventDefault();
        newValue = min;
        break;
      case "End":
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }

    const newValues = [...value];
    newValues[index] = newValue;
    updateValue(newValues);
  };

  // Calcula a largura/altura do range
  const getRangeStyle = () => {
    if (value.length === 1) {
      const percent = valueToPercent(value[0]);
      return orientation === "horizontal"
        ? { left: 0, width: `${percent}%` }
        : { bottom: 0, height: `${percent}%` };
    } else {
      const startPercent = valueToPercent(Math.min(...value));
      const endPercent = valueToPercent(Math.max(...value));
      const size = endPercent - startPercent;
      
      return orientation === "horizontal"
        ? { left: `${startPercent}%`, width: `${size}%` }
        : { bottom: `${startPercent}%`, height: `${size}%` };
    }
  };

  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "relative flex touch-none select-none items-center",
        isHorizontal ? "w-full" : "h-full flex-col",
        className
      )}
      {...props}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className={cn(
          "relative grow overflow-hidden rounded-full bg-secondary",
          isHorizontal ? "h-2 w-full" : "w-2 h-full"
        )}
        onMouseDown={handleTrackMouseDown}
      >
        {/* Range */}
        <div
          className="absolute bg-primary"
          style={{
            ...getRangeStyle(),
            ...(isHorizontal ? { height: "100%" } : { width: "100%" }),
          }}
        />
      </div>

      {/* Thumbs */}
      {value.map((val, index) => {
        const percent = valueToPercent(val);
        const position = isHorizontal
          ? { left: `${percent}%`, transform: "translateX(-50%)" }
          : { bottom: `${percent}%`, transform: "translateY(50%)" };

        return (
          <button
            key={index}
            type="button"
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={val}
            aria-disabled={disabled}
            aria-orientation={orientation}
            tabIndex={disabled ? -1 : 0}
            disabled={disabled}
            className={cn(
              "absolute block h-5 w-5 rounded-full border-2 border-primary bg-background",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              activeThumb === index && "cursor-grabbing",
              !disabled && activeThumb !== index && "cursor-grab"
            )}
            style={position}
            onMouseDown={handleThumbMouseDown(index)}
            onKeyDown={handleKeyDown(index)}
            onFocus={() => setIsFocused(index)}
            onBlur={() => setIsFocused(null)}
          />
        );
      })}
    </div>
  );
}