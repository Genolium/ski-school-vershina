import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  adminGetSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  type ScheduleGroup,
} from "@/lib/api";
import { toast } from "sonner";
import { ScheduleDialog } from "./ScheduleDialog";

const AdminSchedule = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleGroup | null>(null);

  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ["admin-schedule"],
    queryFn: adminGetSchedule,
  });

  const createMutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Группа добавлена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при создании группы");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ScheduleGroup> }) =>
      updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Группа обновлена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении группы");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-schedule"] });
      toast.success("Группа удалена");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении группы");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      group: formData.get("group") as string,
      age_range: formData.get("age_range") as string,
      days: formData.get("days") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      spots: parseInt(formData.get("spots") as string),
      price: formData.get("price") as string || undefined,
      is_active: formData.get("is_active") === "on",
      order: parseInt(formData.get("order") as string) || 0,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAdd = () => {
    try {
      console.log("handleAdd called, setting isDialogOpen to true");
      setEditingItem(null);
      setIsDialogOpen(true);
      console.log("isDialogOpen should be true now");
    } catch (error) {
      console.error("Error in handleAdd:", error);
      toast.error("Ошибка при открытии формы");
    }
  };

  const handleEdit = (item: ScheduleGroup) => {
    try {
      console.log("handleEdit called, setting isDialogOpen to true", item);
      setEditingItem(item);
      setIsDialogOpen(true);
      console.log("isDialogOpen should be true now");
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast.error("Ошибка при открытии формы редактирования");
    }
  };

  useEffect(() => {
    console.log("isDialogOpen changed:", isDialogOpen);
  }, [isDialogOpen]);

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }
  
  return (
    <div className="space-y-4">
      <ScheduleDialog
        key={`dialog-${isDialogOpen ? 'open' : 'closed'}-${editingItem?.id || 'new'}`}
        open={isDialogOpen}
        onOpenChange={(open) => {
          console.log("ScheduleDialog onOpenChange called with:", open);
          setIsDialogOpen(open);
        }}
        editingItem={editingItem}
        onSubmit={handleSubmit}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Расписание</h2>
        <Button type="button" onClick={handleAdd}>
          Добавить группу
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Группа</TableHead>
            <TableHead>Возраст</TableHead>
            <TableHead>Дни</TableHead>
            <TableHead>Время</TableHead>
            <TableHead>Локация</TableHead>
            <TableHead>Места</TableHead>
            <TableHead>Стоимость</TableHead>
            <TableHead>Активна</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.group}</TableCell>
              <TableCell>{item.age_range}</TableCell>
              <TableCell>{item.days}</TableCell>
              <TableCell>{item.time}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{item.spots}</TableCell>
              <TableCell>{item.price || "-"}</TableCell>
              <TableCell>{item.is_active ? "Да" : "Нет"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Редактировать
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Удалить
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить группу?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить. Группа будет удалена навсегда.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
    </div>
  );
};

export default AdminSchedule;

