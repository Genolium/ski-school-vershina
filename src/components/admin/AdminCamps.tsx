import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ArrowDown } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  adminGetCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  type Camp,
} from "@/lib/api";
import { calculateSwappedOrders, calculateReorderedList, sortByOrder } from "@/lib/reorderUtils";
import { DraggableTableRow, DragHandle } from "./DraggableTableRow";

const AdminCamps = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Camp | null>(null);

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: number; order: number }[]) => {
      await Promise.all(
        updates.map((u) => updateCamp(u.id, { order: u.order }))
      );
    },
    onMutate: async (updates: { id: number; order: number }[]) => {
      await queryClient.cancelQueries({ queryKey: ["admin-camps"] });
      const previousCamps = queryClient.getQueryData<Camp[]>(["admin-camps"]);
      queryClient.setQueryData<Camp[]>(["admin-camps"], (old) => {
        if (!old) return [];
        const updatesMap = new Map(updates.map((u) => [u.id, u.order]));
        return old.map((c) =>
          updatesMap.has(c.id) ? { ...c, order: updatesMap.get(c.id)! } : c
        );
      });
      return { previousCamps };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCamps) {
        queryClient.setQueryData(["admin-camps"], context.previousCamps);
      }
      toast.error("Ошибка обновления");
    },
    onSuccess: () => {
      toast.success("Порядок изменен");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
    },
  });

  const isReordering = reorderMutation.isPending;

  const { data: camps = [], isLoading, error } = useQuery({
    queryKey: ["admin-camps"],
    queryFn: adminGetCamps,
    retry: 1,
  });

  const sortedCamps = sortByOrder(camps);

  useEffect(() => {
    if (error) {
      console.error("Error loading camps:", error);
      toast.error("Ошибка загрузки сборов");
    }
  }, [error]);

  const createMutation = useMutation({
    mutationFn: createCamp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Сборы добавлены");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при создании сборов");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Camp> }) =>
      updateCamp(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Сборы обновлены");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении сборов");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCamp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
      toast.success("Сборы удалены");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении сборов");
    },
  });

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const swap = calculateSwappedOrders(sortedCamps, index, direction);
    if (!swap) return;

    reorderMutation.mutate([
      { id: swap.currentItem.id, order: swap.currentItem.order },
      { id: swap.targetItem.id, order: swap.targetItem.order },
    ]);
  };

  const handleDragReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const { changedItems } = calculateReorderedList(sortedCamps, fromIndex, toIndex);
    if (changedItems.length > 0) {
      reorderMutation.mutate(changedItems);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderVal = parseInt(formData.get("order") as string, 10);
    const data = {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      location_desc: formData.get("location_desc") as string || "",
      dates: formData.get("dates") as string,
      duration: formData.get("duration") as string || "",
      group_size: formData.get("group_size") as string || "",
      group_desc: formData.get("group_desc") as string || "",
      training_desc: formData.get("training_desc") as string || "",
      included_items: formData.get("included_items") as string || "",
      stats: formData.get("stats") as string || "",
      order: isNaN(orderVal) ? 0 : orderVal,
      is_active: formData.get("is_active") === "on",
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Ошибка загрузки сборов. Пожалуйста, обновите страницу.
      </div>
    );
  }

  return (
    <>
      <Dialog 
        key={`dialog-${isDialogOpen ? 'open' : 'closed'}-${editingItem?.id || 'new'}`}
        open={isDialogOpen} 
        onOpenChange={(open) => {
          console.log("AdminCamps Dialog onOpenChange:", open);
          setIsDialogOpen(open);
          if (!open) {
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Редактировать сборы" : "Добавить сборы"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название</Label>
                  <Input id="title" name="title" defaultValue={editingItem?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Локация</Label>
                  <Input id="location" name="location" defaultValue={editingItem?.location} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_desc">Описание локации</Label>
                <Input id="location_desc" name="location_desc" defaultValue={editingItem?.location_desc} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dates">Даты</Label>
                  <Input id="dates" name="dates" defaultValue={editingItem?.dates} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Продолжительность</Label>
                  <Input id="duration" name="duration" defaultValue={editingItem?.duration} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group_size">Размер группы</Label>
                  <Input id="group_size" name="group_size" defaultValue={editingItem?.group_size} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group_desc">Описание группы</Label>
                  <Input id="group_desc" name="group_desc" defaultValue={editingItem?.group_desc} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="training_desc">Описание тренировок</Label>
                <Textarea id="training_desc" name="training_desc" defaultValue={editingItem?.training_desc} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="included_items">Включено (JSON массив)</Label>
                <Textarea id="included_items" name="included_items" defaultValue={editingItem?.included_items} placeholder='["Проживание", "Питание"]' />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stats">Статистика (JSON объект)</Label>
                <Textarea id="stats" name="stats" defaultValue={editingItem?.stats} placeholder='{"camps_count": "5", "participants": "80+"}' />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Порядок отображения (меньше = выше)</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue={editingItem?.order ?? 0}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox id="is_active" name="is_active" defaultChecked={editingItem?.is_active !== false} />
                  <Label htmlFor="is_active">Активны</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button type="submit">{editingItem ? "Сохранить" : "Добавить"}</Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Сборы</h2>
          <Button 
            type="button" 
            onClick={() => {
              setEditingItem(null);
              setIsDialogOpen(true);
            }}
          >
            Добавить сборы
          </Button>
        </div>

        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36 text-center">Порядок</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Локация</TableHead>
            <TableHead>Даты</TableHead>
            <TableHead>Активны</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCamps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Сборы не добавлены
              </TableCell>
            </TableRow>
          ) : (
            sortedCamps.map((item, index) => (
            <DraggableTableRow
              key={item.id}
              index={index}
              onReorder={handleDragReorder}
              disabled={isReordering}
            >
              <TableCell className="text-center">
                <div className="inline-flex items-center gap-1 justify-center">
                  <DragHandle disabled={isReordering} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === 0 || isReordering}
                    onClick={() => handleReorder(index, 'up')}
                    title="Поднять выше"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center font-mono text-sm font-semibold">
                    {item.order ?? 0}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === sortedCamps.length - 1 || isReordering}
                    onClick={() => handleReorder(index, 'down')}
                    title="Опустить ниже"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell>{item.dates}</TableCell>
              <TableCell>{item.is_active ? "Да" : "Нет"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { 
                    setEditingItem(item);
                    setIsDialogOpen(true);
                  }}
                  >
                    Редактировать
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Удалить</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Удалить сборы?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Это действие нельзя отменить.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)} className="bg-destructive">
                          Удалить
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </DraggableTableRow>
            ))
          )}
        </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminCamps;

