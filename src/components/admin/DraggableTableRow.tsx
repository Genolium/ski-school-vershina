import React, { useState } from "react";
import { TableRow } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DraggableTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  index: number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Обертка для строки таблицы с поддержкой HTML5 Drag-and-Drop.
 * Отображает визуальную индикацию перемещения (прозрачность при перетаскивании,
 * индикаторную линию на месте сброса) и вызывает callback onReorder(fromIndex, toIndex).
 */
export const DraggableTableRow = ({
  index,
  onReorder,
  disabled = false,
  children,
  className,
  ...props
}: DraggableTableRowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (disabled) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const clientY = e.clientY ?? (rect.top + 1);
    const pos = clientY < midY ? "top" : "bottom";
    if (dropPosition !== pos) {
      setDropPosition(pos);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    if (disabled) return;
    e.preventDefault();
    setDropPosition(null);
    setIsDragging(false);

    const fromIndexStr = e.dataTransfer.getData("text/plain");
    const fromIndex = parseInt(fromIndexStr, 10);

    if (isNaN(fromIndex) || fromIndex === index) return;
    onReorder(fromIndex, index);
  };

  return (
    <TableRow
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`draggable-row-${index}`}
      className={cn(
        "transition-all duration-150",
        isDragging && "opacity-40 bg-muted/60 scale-[0.99]",
        dropPosition === "top" && "border-t-2 border-primary shadow-sm",
        dropPosition === "bottom" && "border-b-2 border-primary shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </TableRow>
  );
};

export interface DragHandleProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  disabled?: boolean;
}

/**
 * Иконка-рукоятка для перетаскивания (GripVertical) с визуальными стилями курсора.
 */
export const DragHandle = ({
  className,
  disabled = false,
  ...props
}: DragHandleProps) => (
  <span
    className={cn(
      "inline-flex items-center justify-center p-1 rounded text-muted-foreground transition-colors",
      disabled
        ? "opacity-30 cursor-not-allowed"
        : "cursor-grab active:cursor-grabbing hover:text-foreground hover:bg-muted touch-none",
      className
    )}
    title="Перетащите для изменения порядка"
    aria-label="Перетащить строку"
    data-testid="drag-handle"
    {...props}
  >
    <GripVertical className="h-4 w-4" />
  </span>
);

export default DraggableTableRow;
