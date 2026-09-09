import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ListPlus, Sparkles, Check, Edit3 } from "lucide-react";
import { parseSmartArray, serializeSmartArray } from "@/lib/arrayParser";

interface ItemsArrayInputProps {
  id?: string;
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  presets?: string[];
  description?: string;
}

export const ItemsArrayInput: React.FC<ItemsArrayInputProps> = ({
  id,
  name,
  label,
  defaultValue = "",
  placeholder = "Введите пункт и нажмите Enter...",
  presets = [],
  description,
}) => {
  const [items, setItems] = useState<string[]>(() => parseSmartArray(defaultValue));
  const [newItemText, setNewItemText] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Синхронизация при смене defaultValue
  useEffect(() => {
    setItems(parseSmartArray(defaultValue));
  }, [defaultValue]);

  const handleAddItem = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Если вставили строку с точками с запятой или переносами - умно парсим
    const parsed = parseSmartArray(trimmed);
    if (parsed.length > 0) {
      setItems((prev) => {
        const combined = [...prev];
        for (const p of parsed) {
          if (!combined.includes(p)) {
            combined.push(p);
          }
        }
        return combined;
      });
      setNewItemText("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem(newItemText);
    }
  };

  const handleApplyBulk = () => {
    const parsed = parseSmartArray(bulkText);
    setItems(parsed);
    setIsBulkMode(false);
  };

  const handleOpenBulk = () => {
    setBulkText(items.join("\n"));
    setIsBulkMode(true);
  };

  const jsonValue = serializeSmartArray(items);

  return (
    <div className="space-y-2.5 rounded-xl border border-border/80 bg-card/60 p-3.5 sm:p-4 shadow-sm">
      {/* Скрытый input для нативной отправки в FormData */}
      <input type="hidden" id={id || name} name={name} value={jsonValue} />

      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id || name} className="text-sm font-semibold flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>{label}</span>
          <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
        </Label>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => (isBulkMode ? handleApplyBulk() : handleOpenBulk())}
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          {isBulkMode ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" />
              <span>Применить</span>
            </>
          ) : (
            <>
              <Edit3 className="h-3.5 w-3.5" />
              <span>Списком / Текстом</span>
            </>
          )}
        </Button>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}

      {isBulkMode ? (
        <div className="space-y-2 pt-1">
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={5}
            placeholder="Введите каждый пункт с новой строки или через точку с запятой..."
            className="text-xs sm:text-sm font-sans"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Каждая строка или блок между «;» станет отдельным пунктом
            </span>
            <Button type="button" size="sm" onClick={handleApplyBulk} className="h-7 text-xs">
              Готово
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Список уже добавленных элементов */}
          {items.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 rounded-lg bg-muted/40 border border-border/50">
              {items.map((item, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="gap-1.5 py-1 px-2.5 text-xs font-normal bg-background border border-border shadow-xs hover:border-primary/50 transition-colors"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 transition-colors"
                    title="Удалить"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic py-2 px-3 rounded-lg bg-muted/20 border border-dashed border-border/60 text-center">
              Список пуст. Добавьте пункты ниже или воспользуйтесь быстрыми подсказками.
            </div>
          )}

          {/* Строка добавления нового элемента */}
          <div className="flex gap-2">
            <Input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="h-9 text-xs sm:text-sm"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => handleAddItem(newItemText)}
              disabled={!newItemText.trim()}
              className="h-9 gap-1 px-3 text-xs shrink-0"
              aria-label="Добавить пункт"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Добавить пункт</span>
            </Button>
          </div>

          {/* Быстрые пресеты */}
          {presets.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                Быстрое добавление:
              </span>
              <div className="flex flex-wrap gap-1">
                {presets.map((preset) => {
                  const alreadyAdded = items.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddItem(preset)}
                      className={`inline-flex items-center gap-1 text-[11px] py-0.5 px-2 rounded-md border transition-all ${
                        alreadyAdded
                          ? "opacity-40 bg-muted text-muted-foreground border-transparent cursor-not-allowed"
                          : "bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 border-border text-foreground/80 cursor-pointer"
                      }`}
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>{preset}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
