import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { type ScheduleGroup } from "@/lib/api";
import { useEffect } from "react";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: ScheduleGroup | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ScheduleDialog = ({ open, onOpenChange, editingItem, onSubmit }: ScheduleDialogProps) => {
  useEffect(() => {
    console.log("ScheduleDialog - open prop changed:", open);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      console.log("ScheduleDialog internal onOpenChange:", open);
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Редактировать группу" : "Добавить группу"}
          </DialogTitle>
          <DialogDescription>
            Заполните форму для {editingItem ? "редактирования" : "добавления"} группы
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group">Группа</Label>
              <Input
                id="group"
                name="group"
                defaultValue={editingItem?.group}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_range">Возраст</Label>
              <Input
                id="age_range"
                name="age_range"
                defaultValue={editingItem?.age_range}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days">Дни</Label>
              <Input
                id="days"
                name="days"
                defaultValue={editingItem?.days}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                name="time"
                defaultValue={editingItem?.time}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Локация</Label>
              <Input
                id="location"
                name="location"
                defaultValue={editingItem?.location}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spots">Места</Label>
              <Input
                id="spots"
                name="spots"
                type="number"
                defaultValue={editingItem?.spots || 0}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Стоимость</Label>
              <Input
                id="price"
                name="price"
                defaultValue={editingItem?.price || ""}
                placeholder="6000 р/мес."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Порядок</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={editingItem?.order || 0}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="is_active"
                name="is_active"
                defaultChecked={editingItem?.is_active !== false}
              />
              <Label htmlFor="is_active">Активна</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">
              {editingItem ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

