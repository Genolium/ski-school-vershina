import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { type Tariff } from "@/lib/api";
import { useEffect } from "react";
import { ItemsArrayInput } from "./ItemsArrayInput";

interface TariffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Tariff | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const TariffDialog = ({ open, onOpenChange, editingItem, onSubmit }: TariffDialogProps) => {
  useEffect(() => {
    console.log("TariffDialog - open prop changed:", open);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      console.log("TariffDialog internal onOpenChange:", open);
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto px-3 sm:px-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {editingItem ? "Редактировать тариф" : "Добавить тариф"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Заполните форму для {editingItem ? "редактирования" : "добавления"} тарифа
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">Название</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingItem?.title}
                placeholder="Active, Standard, Pro, Individual"
                required
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs sm:text-sm">Стоимость</Label>
              <Input
                id="price"
                name="price"
                defaultValue={editingItem?.price}
                placeholder="6000 р/мес. или 2500 р/час"
                required
                className="text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">Описание</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={editingItem?.description}
              placeholder="Для семейного отдыха и поддержания формы"
              required
              rows={3}
              className="text-sm sm:text-base"
            />
          </div>

          <ItemsArrayInput
            name="features"
            id="features"
            label="Особенности тарифа"
            defaultValue={editingItem?.features || "[]"}
            presets={[
              "1 тренировка в неделю",
              "2 тренировки в неделю",
              "3 тренировки в неделю",
              "Индивидуальный график",
              "Участие в соревнованиях",
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="order" className="text-xs sm:text-sm">Порядок</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={editingItem?.order || 0}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6 sm:pt-8">
              <Checkbox
                id="is_active"
                name="is_active"
                defaultChecked={editingItem?.is_active !== false}
              />
              <Label htmlFor="is_active" className="text-xs sm:text-sm cursor-pointer">Активен</Label>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Отмена
            </Button>
            <Button type="submit" className="w-full sm:w-auto text-sm sm:text-base">
              {editingItem ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

