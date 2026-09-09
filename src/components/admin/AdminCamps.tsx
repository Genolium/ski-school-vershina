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
  DialogDescription,
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
import { ItemsArrayInput } from "./ItemsArrayInput";
import { StatsObjectInput } from "./StatsObjectInput";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  parseSmartArray,
  serializeSmartArray,
  parseSmartObject,
  serializeSmartObject,
} from "@/lib/arrayParser";

const AdminCamps = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Camp | null>(null);
  const [orderValue, setOrderValue] = useState<number>(0);

  const reorderMutation = useMutation({
    mutationFn: async (itemsToUpdate: { id: number; order: number }[]) => {
      await Promise.all(
        itemsToUpdate.map((item) => updateCamp(item.id, { order: item.order }))
      );
    },
    onMutate: async (itemsToUpdate) => {
      await queryClient.cancelQueries({ queryKey: ["admin-camps"] });
      const previousCamps = queryClient.getQueryData<Camp[]>(["admin-camps"]) || [];
      const orderMap = new Map(itemsToUpdate.map((u) => [u.id, u.order]));
      const updatedCamps = previousCamps.map((c) =>
        orderMap.has(c.id) ? { ...c, order: orderMap.get(c.id)! } : c
      );
      queryClient.setQueryData(["admin-camps"], updatedCamps);
      return { previousCamps };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCamps) {
        queryClient.setQueryData(["admin-camps"], context.previousCamps);
      }
      toast.error("Не удалось изменить порядок");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-camps"] });
    },
    onSuccess: () => {
      toast.success("Порядок изменен");
    },
  });

  const isReordering = reorderMutation.isPending;

  const { data: camps = [], isLoading, error } = useQuery({
    queryKey: ["admin-camps"],
    queryFn: adminGetCamps,
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

  const handleOpenAdd = () => {
    setEditingItem(null);
    const nextOrder =
      sortedCamps.length > 0
        ? (Math.max(...sortedCamps.map((c) => c.order ?? 0)) + 1)
        : 0;
    setOrderValue(nextOrder);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: Camp) => {
    setEditingItem(item);
    setOrderValue(item.order ?? 0);
    setIsDialogOpen(true);
  };

  const totalCampsCount = editingItem
    ? sortedCamps.length
    : sortedCamps.length + 1;
  const firstCampOrder = sortedCamps[0]?.order ?? 0;
  const lastCampOrder = sortedCamps[sortedCamps.length - 1]?.order ?? 0;

  const quickPositions: { label: string; value: number }[] = [];
  if (sortedCamps.length === 0) {
    quickPositions.push({ label: "№1 (В начало)", value: 0 });
  } else {
    quickPositions.push({
      label: "№1 (В начало)",
      value: Math.min(0, firstCampOrder - 1),
    });

    if (sortedCamps.length >= 2) {
      for (let i = 1; i < Math.min(sortedCamps.length, 5); i++) {
        quickPositions.push({
          label: `№${i + 1}`,
          value: sortedCamps[i]?.order ?? i,
        });
      }
    }

    const endPositionLabel = `№${totalCampsCount} (В конец)`;
    const endOrderValue = lastCampOrder + 1;
    if (!quickPositions.some((p) => p.label.startsWith(`№${totalCampsCount}`))) {
      quickPositions.push({
        label: endPositionLabel,
        value: endOrderValue,
      });
    }
  }

  const getDisplayPositionNumber = (val: number): number => {
    const otherCamps = editingItem
      ? sortedCamps.filter((c) => c.id !== editingItem.id)
      : sortedCamps;
    const temp = [...otherCamps, { id: -1, order: val }];
    const sorted = sortByOrder(temp);
    const idx = sorted.findIndex((c) => c.id === -1);
    return idx >= 0 ? idx + 1 : 1;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderVal = parseInt(formData.get("order") as string, 10);
    const rawIncluded = (formData.get("included_items") as string) || "";
    const rawStats = (formData.get("stats") as string) || "";

    const data = {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      location_desc: formData.get("location_desc") as string || "",
      dates: formData.get("dates") as string,
      duration: formData.get("duration") as string || "",
      group_size: formData.get("group_size") as string || "",
      group_desc: formData.get("group_desc") as string || "",
      training_desc: formData.get("training_desc") as string || "",
      included_items: serializeSmartArray(parseSmartArray(rawIncluded)),
      stats: serializeSmartObject(parseSmartObject(rawStats)),
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
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                {editingItem ? "Редактирование сборов и настройка их позиции" : "Заполните данные для добавления новых сборов"}
              </DialogDescription>
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
              <ItemsArrayInput
                id="included_items"
                name="included_items"
                label="Что включено в сборы"
                defaultValue={editingItem?.included_items}
                placeholder="Например: Проживание в отеле..."
                presets={[
                  "Проживание",
                  "3-х разовое питание",
                  "3 тренировки в день",
                  "Видеоразбор техники",
                  "Ски-пасс",
                  "Трансфер",
                  "Спортивная страховка",
                  "Развлекательная программа",
                ]}
                description="Массив пунктов формируется автоматически без необходимости вручную писать JSON."
              />

              <StatsObjectInput
                id="stats"
                name="stats"
                label="Статистика сборов"
                defaultValue={editingItem?.stats}
              />
              
              <div className="space-y-2.5 rounded-xl border border-border/80 bg-muted/20 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <Label htmlFor="order" className="text-sm font-semibold">
                    Порядок отображения
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Будет на позиции: <strong className="text-primary font-mono font-semibold">№{getDisplayPositionNumber(orderValue)}</strong> из {totalCampsCount}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={orderValue}
                    onChange={(e) => setOrderValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full sm:w-28 font-mono text-sm"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    <span className="text-xs text-muted-foreground mr-1">Быстрый выбор:</span>
                    {quickPositions.map((pos) => (
                      <Button
                        key={pos.label}
                        type="button"
                        size="sm"
                        variant={orderValue === pos.value ? "default" : "outline"}
                        className="h-7 text-xs px-2.5"
                        onClick={() => setOrderValue(pos.value)}
                      >
                        {pos.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Меньшее число = выше в списке (№1 отображается первым на сайте).
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="is_active" name="is_active" defaultChecked={editingItem?.is_active !== false} />
                <Label htmlFor="is_active" className="cursor-pointer">Активны (отображаются на сайте)</Label>
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
            onClick={handleOpenAdd}
          >
            Добавить сборы
          </Button>
        </div>

        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 text-center">Порядок</TableHead>
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
                <TooltipProvider delayDuration={200}>
                  <div className="inline-flex items-center gap-1.5 justify-center bg-muted/40 p-1 rounded-lg border border-border/50">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <DragHandle
                            disabled={isReordering}
                            title="Перетащить строку"
                            aria-label="Перетащить строку"
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">Перетащить строку</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-background shadow-xs hover:bg-primary/10 hover:text-primary transition-colors"
                          disabled={index === 0 || isReordering}
                          onClick={() => handleReorder(index, 'up')}
                          title="Выше"
                          aria-label="Выше"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Выше</TooltipContent>
                    </Tooltip>

                    <Badge
                      variant="secondary"
                      className="px-2 py-0.5 min-w-[2.5rem] justify-center text-xs font-bold font-mono tracking-tight bg-primary/10 text-primary border border-primary/20"
                      title={`Позиция №${index + 1} (порядок: ${item.order ?? index})`}
                      data-testid={`camp-position-${index}`}
                    >
                      №{index + 1}
                    </Badge>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-background shadow-xs hover:bg-primary/10 hover:text-primary transition-colors"
                          disabled={index === sortedCamps.length - 1 || isReordering}
                          onClick={() => handleReorder(index, 'down')}
                          title="Ниже"
                          aria-label="Ниже"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Ниже</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
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
                    onClick={() => handleOpenEdit(item)}
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

