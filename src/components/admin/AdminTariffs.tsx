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
  adminGetTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
  type Tariff,
} from "@/lib/api";
import { toast } from "sonner";
import { TariffDialog } from "./TariffDialog";

const AdminTariffs = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tariff | null>(null);

  const { data: tariffs = [], isLoading } = useQuery({
    queryKey: ["admin-tariffs"],
    queryFn: adminGetTariffs,
  });

  const createMutation = useMutation({
    mutationFn: createTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tariffs"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Тариф добавлен");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при создании тарифа");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tariff> }) =>
      updateTariff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tariffs"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Тариф обновлен");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при обновлении тарифа");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tariffs"] });
      toast.success("Тариф удален");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ошибка при удалении тарифа");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      features: formData.get("features") as string,
      price: formData.get("price") as string,
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

  const handleEdit = (item: Tariff) => {
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
    return <div className="text-center py-8 text-sm sm:text-base">Загрузка...</div>;
  }
  
  return (
    <div className="space-y-4">
      <TariffDialog
        key={`dialog-${isDialogOpen ? 'open' : 'closed'}-${editingItem?.id || 'new'}`}
        open={isDialogOpen}
        onOpenChange={(open) => {
          console.log("TariffDialog onOpenChange called with:", open);
          setIsDialogOpen(open);
        }}
        editingItem={editingItem}
        onSubmit={handleSubmit}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">Тарифы</h2>
        <Button type="button" onClick={handleAdd} className="w-full sm:w-auto text-sm sm:text-base">
          Добавить тариф
        </Button>
      </div>

      {tariffs.length === 0 ? (
        <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
          Тарифы не найдены. Добавьте первый тариф.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Название</TableHead>
                <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Описание</TableHead>
                <TableHead className="text-xs sm:text-sm">Стоимость</TableHead>
                <TableHead className="hidden md:table-cell text-xs sm:text-sm">Активен</TableHead>
                <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Порядок</TableHead>
                <TableHead className="text-xs sm:text-sm">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tariffs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-xs sm:text-sm">{item.title}</TableCell>
                  <TableCell className="hidden sm:table-cell max-w-md truncate text-xs sm:text-sm">{item.description}</TableCell>
                  <TableCell className="font-semibold text-primary text-xs sm:text-sm">{item.price}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm">{item.is_active ? "Да" : "Нет"}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{item.order}</TableCell>
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="text-xs sm:text-sm px-2 sm:px-3"
                      >
                        Редактировать
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                            Удалить
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-sm sm:text-base">Удалить тариф?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs sm:text-sm">
                              Это действие нельзя отменить. Тариф будет удален навсегда.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="text-xs sm:text-sm w-full sm:w-auto">Отмена</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs sm:text-sm w-full sm:w-auto"
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
      )}
    </div>
  );
};

export default AdminTariffs;

