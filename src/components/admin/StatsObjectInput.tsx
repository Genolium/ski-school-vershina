import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Plus, Trash2, Code2, SlidersHorizontal } from "lucide-react";
import { parseSmartObject, serializeSmartObject } from "@/lib/arrayParser";

interface StatsObjectInputProps {
  id?: string;
  name: string;
  label: string;
  defaultValue?: string;
}

export const StatsObjectInput: React.FC<StatsObjectInputProps> = ({
  id,
  name,
  label,
  defaultValue = "{}",
}) => {
  const [stats, setStats] = useState<Record<string, string>>(() =>
    parseSmartObject(defaultValue)
  );
  const [isRawMode, setIsRawMode] = useState(false);
  const [rawText, setRawText] = useState(() => defaultValue);
  const [customKey, setCustomKey] = useState("");
  const [customVal, setCustomVal] = useState("");

  useEffect(() => {
    const parsed = parseSmartObject(defaultValue);
    setStats(parsed);
    setRawText(serializeSmartObject(parsed));
  }, [defaultValue]);

  const updateField = (key: string, value: string) => {
    setStats((prev) => {
      const next = { ...prev, [key]: value };
      setRawText(serializeSmartObject(next));
      return next;
    });
  };

  const removeField = (key: string) => {
    setStats((prev) => {
      const next = { ...prev };
      delete next[key];
      setRawText(serializeSmartObject(next));
      return next;
    });
  };

  const handleAddCustom = () => {
    if (!customKey.trim()) return;
    updateField(customKey.trim(), customVal.trim());
    setCustomKey("");
    setCustomVal("");
  };

  const handleRawChange = (text: string) => {
    setRawText(text);
    const parsed = parseSmartObject(text);
    setStats(parsed);
  };

  const jsonValue = serializeSmartObject(stats);

  // Известные стандартные поля для сборов
  const knownFields = [
    { key: "camps_count", label: "Количество сборов", placeholder: "5" },
    { key: "participants", label: "Участников сборов", placeholder: "80+" },
    { key: "recommend_rate", label: "Рекомендуют родителей", placeholder: "100%" },
  ];

  // Пользовательские дополнительные поля
  const customEntries = Object.entries(stats).filter(
    ([k]) => !knownFields.some((kf) => kf.key === k)
  );

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-3.5 sm:p-4 shadow-sm">
      {/* Скрытый input для отправки в FormData */}
      <input type="hidden" id={id || name} name={name} value={jsonValue} />

      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id || name} className="text-sm font-semibold flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>{label}</span>
        </Label>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsRawMode(!isRawMode)}
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          {isRawMode ? (
            <>
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              <span>Удобный конструктор</span>
            </>
          ) : (
            <>
              <Code2 className="h-3.5 w-3.5" />
              <span>JSON режим</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Показатели, отображаемые в карточке сборов (формируются в JSON автоматически).
      </p>

      {isRawMode ? (
        <div className="space-y-2">
          <Textarea
            value={rawText}
            onChange={(e) => handleRawChange(e.target.value)}
            rows={4}
            className="text-xs sm:text-sm font-mono"
            placeholder='{"camps_count": "5", "participants": "80+"}'
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Стандартные понятные поля */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {knownFields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`stat-${field.key}`} className="text-xs text-muted-foreground">
                  {field.label}
                </Label>
                <Input
                  id={`stat-${field.key}`}
                  value={stats[field.key] || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-8 text-xs sm:text-sm"
                />
              </div>
            ))}
          </div>

          {/* Дополнительные пользовательские поля */}
          {customEntries.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-border/40">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Дополнительные параметры:
              </span>
              <div className="space-y-1.5">
                {customEntries.map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded min-w-28 text-foreground/80">
                      {k}:
                    </span>
                    <Input
                      value={v}
                      onChange={(e) => updateField(k, e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(k)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Добавить произвольный параметр */}
          <div className="pt-1 flex items-center gap-1.5">
            <Input
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Название метрики..."
              className="h-8 text-xs flex-1"
            />
            <Input
              value={customVal}
              onChange={(e) => setCustomVal(e.target.value)}
              placeholder="Значение..."
              className="h-8 text-xs flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddCustom}
              disabled={!customKey.trim()}
              className="h-8 px-2.5 text-xs gap-1 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Добавить параметр</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
